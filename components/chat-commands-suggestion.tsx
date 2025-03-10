import { cn } from "@/lib/utils";
import { commands } from "@/lib/utils/constant";
import { ArrowDown, ArrowUp, CornerDownRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

export interface ChatCommandsSuggestionProps {
  value?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  setValue: (value: string) => void;
}

const ChatCommandsSuggestion = ({
  inputRef,
  value,
  setValue,
  ...props
}: ChatCommandsSuggestionProps) => {
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      let predictionIndex = selectedCommandIndex;
      if (e.key === "ArrowDown") {
        const nextIndex =
          selectedCommandIndex + 1 > commands.length - 1
            ? 0
            : selectedCommandIndex + 1;
        predictionIndex = nextIndex;
      }
      if (e.key === "ArrowUp") {
        const nextIndex =
          selectedCommandIndex - 1 < 0
            ? commands.length - 1
            : selectedCommandIndex - 1;
        predictionIndex = nextIndex;
      }
      setSelectedCommandIndex(predictionIndex);

      inputRef?.current?.focus();
    };

    const handleSelect = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
      }

      if (e.key === "Enter") {
        const command = commands[selectedCommandIndex];
        e.stopPropagation();
        e.preventDefault();
        setValue(command.script);
      }

      if (e.key === "Backspace") {
        setValue("");
      }
    };

    document.addEventListener("keydown", handler);

    inputRef?.current?.addEventListener("keydown", handleSelect);

    return () => {
      document.removeEventListener("keydown", handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      inputRef?.current?.removeEventListener("keydown", handleSelect);
    };
  }, [selectedCommandIndex, setValue, inputRef]);

  // const processingCommand = useMemo(() => {
  //   if (!value) {
  //     return commands;
  //   }

  //   return commands.filter((c) =>
  //     c.usage.toLowerCase().includes(value.toLowerCase())
  //   );
  // }, [value]);

  // if (!processingCommand.length) {
  //   return null;
  // }

  return (
    <div
      className={cn(
        "border border-border rounded-md bg-background min-h-[200px] absolute bottom-[140px] w-[calc(100%-2rem)]",
        "px-4 py-3 left-1/2 -translate-x-1/2"
      )}
    >
      <div className="mb-3 flex items-center gap-4">
        <p className="text-xs text-muted-foreground">Suggestions</p>
        <div className="flex ml-auto">
          <span className="text-xs text-muted-foreground mr-2">
            Use arrows to navigate
          </span>
          <span className="size-4 rounded-md border border-border grid place-items-center">
            <ArrowUp className="size-2" />
          </span>
          <span className="size-4 rounded-md border border-border grid place-items-center">
            <ArrowDown className="size-2" />
          </span>

          <span className="text-xs text-muted-foreground mr-2 ml-4">
            Select
          </span>
          <span className="size-4 rounded-md border border-border grid place-items-center">
            <CornerDownRight className="size-2" />
          </span>
        </div>
        {/* 
        <input
          type="text"
          className="ml-auto focus:border-none focus:outline-none bg-background placeholder:text-xs text-right"
          placeholder="Search commands"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}
      </div>

      <div className="flex flex-col gap-2">
        {commands.map((command, index) => (
          <div
            key={command.name}
            className={cn(
              "flex flex-col gap-1",
              "data-[state=selected]:bg-secondary px-4 py-2 rounded-md cursor-pointer"
            )}
            data-state={selectedCommandIndex === index ? "selected" : "idle"}
            onClick={() => {
              setSelectedCommandIndex(index);
              setValue(command.script);
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground font-semibold">
                {command.name}
              </p>
              <p className="text-sm text-muted-foreground">{command.usage}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {command.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatCommandsSuggestion;
