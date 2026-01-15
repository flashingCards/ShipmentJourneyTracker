"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/app-provider";
import { cn } from "@/lib/utils";
import { JourneyMode } from "@/lib/types";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ConfigurePage() {
  const {
    journeyConfig,
    setJourneyConfig,
    activeJourneyMode,
    setActiveJourneyMode,
  } = useAppContext();

  const [localConfig, setLocalConfig] = React.useState(journeyConfig);

  React.useEffect(() => {
    setLocalConfig(journeyConfig);
  }, [journeyConfig]);

  const handleModeChange = (mode: string) => {
    setActiveJourneyMode(Number(mode) as JourneyMode);
  };

  const handleDaysChange = (node: string, days: string) => {
    const dayValue = Number(days);
    if (isNaN(dayValue) || dayValue < 0) return;

    setLocalConfig((prev) => ({
      ...prev,
      [activeJourneyMode]: prev[activeJourneyMode].map((item) =>
        item.node === node ? { ...item, days: dayValue } : item
      ),
    }));
  };

  const currentModeConfig = localConfig[activeJourneyMode];
  const totalDays = currentModeConfig.reduce((acc, item) => acc + item.days, 0);
  const isValid = totalDays === activeJourneyMode;

  const handleSaveChanges = () => {
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Configuration",
        description: `Total days must sum up to ${activeJourneyMode}. Current total is ${totalDays}.`,
      });
      return;
    }
    setJourneyConfig(localConfig);
    toast({
      title: "Configuration Saved",
      description: "Your journey configuration has been updated.",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-headline">
          Journey Configuration
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Define shipment journey duration logic by selecting a mode and assigning days to each stage.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Select Journey Mode</CardTitle>
          <CardDescription>
            Choose a mode to view and edit its configuration. Only one mode can be active at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={String(activeJourneyMode)}
            onValueChange={handleModeChange}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[10, 12, 15].map((mode) => (
              <Label
                key={mode}
                htmlFor={`mode-${mode}`}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-6 text-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                  activeJourneyMode === mode && "border-primary"
                )}
              >
                <RadioGroupItem
                  value={String(mode)}
                  id={`mode-${mode}`}
                  className="sr-only"
                />
                <span className="text-3xl font-bold">{mode}</span>
                <span className="text-sm text-muted-foreground mt-1">Days</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configure Durations for {activeJourneyMode}-Day Mode</CardTitle>
          <CardDescription>
            Assign the number of days for each node in the shipment journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentModeConfig.map((item) => (
            <div
              key={item.node}
              className="flex items-center justify-between gap-4 p-3 rounded-md border bg-card"
            >
              <Label htmlFor={`days-${item.node}`} className="font-medium text-foreground">
                {item.node}
              </Label>
              <Input
                id={`days-${item.node}`}
                type="number"
                min="0"
                value={item.days}
                onChange={(e) => handleDaysChange(item.node, e.target.value)}
                className="w-24"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div
            className={cn(
              "font-bold text-lg",
              isValid ? "text-green-600" : "text-destructive"
            )}
          >
            Total: {totalDays} / {activeJourneyMode} Days
          </div>
          <Button onClick={handleSaveChanges}>
            <Save className="mr-2" />
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {!isValid && (
        <Alert variant="destructive" className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>
            The total number of days ({totalDays}) does not match the selected mode ({activeJourneyMode} days). Please adjust the values before saving.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
