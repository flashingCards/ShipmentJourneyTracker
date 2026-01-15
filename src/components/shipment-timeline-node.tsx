
"use client";

import { format, differenceInDays, parseISO } from "date-fns";
import * as React from "react";
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  addDocumentNonBlocking,
  useUser,
} from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

import type { TimelineEvent, Comment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Send } from "lucide-react";

type ShipmentTimelineNodeProps = {
  shipmentId: string;
  node: TimelineEvent;
  isLast: boolean;
};

const CommentEntry = ({ comment }: { comment: Comment }) => {
  const commentDate =
    comment.createdAt instanceof Date
      ? comment.createdAt
      : comment.createdAt?.toDate();
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 border">
        <AvatarFallback>{comment.userId.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            User {comment.userId.slice(0, 6)}...
          </p>
          <p className="text-xs text-muted-foreground">
            {commentDate ? format(commentDate, "MMM d, yyyy") : "Just now"}
          </p>
        </div>
        <p className="mt-1 text-sm text-foreground">{comment.text}</p>
      </div>
    </div>
  );
};

export default function ShipmentTimelineNode({
  shipmentId,
  node,
  isLast,
}: ShipmentTimelineNodeProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [newComment, setNewComment] = React.useState("");

  const commentsCollectionRef = useMemoFirebase(
    () =>
      firestore ? collection(
        firestore,
        "shipments",
        shipmentId,
        "shipment_nodes",
        node.id,
        "comments"
      ) : null,
    [firestore, shipmentId, node.id]
  );

  const { data: comments, isLoading: isLoadingComments } =
    useCollection<Comment>(commentsCollectionRef);

  const handleAddComment = () => {
    if (!newComment.trim() || !user || !commentsCollectionRef) return;
    addDocumentNonBlocking(commentsCollectionRef, {
      text: newComment,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  };

  const delay =
    node.status === "completed" && node.actualDate
      ? differenceInDays(parseISO(node.actualDate), parseISO(node.plannedDate))
      : 0;

  const nodeStatusStyles = {
    completed: "bg-primary border-primary",
    "in-progress": "bg-accent border-accent animate-pulse",
    pending: "bg-muted-foreground/50 border-muted-foreground/50",
  };

  const iconStatusStyles = {
    completed: "text-primary-foreground",
    "in-progress": "text-accent-foreground",
    pending: "text-muted-foreground",
  };

  return (
    <div className="relative pb-8">
      {!isLast && (
        <div className="absolute left-4 top-5 -ml-px mt-0.5 h-full w-0.5 bg-border" />
      )}
      <div className="relative flex items-start space-x-4">
        <div>
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              nodeStatusStyles[node.status]
            )}
          >
            <node.Icon
              className={cn("h-5 w-5", iconStatusStyles[node.status])}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 pt-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-md font-semibold text-foreground">{node.stage}</p>
            {delay > 0 && (
              <p className="text-sm font-bold text-destructive">
                Delayed by {delay} Day{delay > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Planned:{" "}
              <time dateTime={node.plannedDate}>
                {format(parseISO(node.plannedDate), "MMM d, yyyy")}
              </time>
            </span>
            {node.actualDate && (
              <span>
                Actual:{" "}
                <time dateTime={node.actualDate}>
                  {format(parseISO(node.actualDate), "MMM d, yyyy")}
                </time>
              </span>
            )}
          </div>
          <div className="mt-4 space-y-4">
            {node.commentsFromSheet && (
              <p className="text-sm text-foreground p-3 bg-muted rounded-md border">
                {node.commentsFromSheet}
              </p>
            )}

            {delay > 0 && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h4 className="text-sm font-semibold">Comments</h4>
                  {isLoadingComments ? (
                    <p className="text-sm text-muted-foreground">
                      Loading comments...
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {comments && comments.length > 0 ? (
                        comments
                          .sort(
                            (a, b) =>
                              ((b.createdAt?.toDate()?.getTime() || 0) -
                              (a.createdAt?.toDate()?.getTime() || 0))
                          )
                          .map((comment) => (
                            <CommentEntry key={comment.id} comment={comment} />
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No comments yet.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-start gap-3 pt-4 border-t">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback>
                          {user ? user.uid.slice(0, 2) : '..'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="text-sm"
                          disabled={!user}
                        />
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || !user}
                        >
                          <Send className="mr-2" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
