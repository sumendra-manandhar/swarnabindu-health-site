"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NepaliDatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

// Nepali months
const nepaliMonths = [
  "बैशाख",
  "जेठ",
  "आषाढ",
  "श्रावण",
  "भाद्र",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
];

// Days in each Nepali month (simplified - in reality this varies by year)
const daysInMonth = [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30];

// Convert Gregorian to approximate Bikram Sambat
const gregorianToBikramSambat = (gregorianDate: Date) => {
  const bsYear = gregorianDate.getFullYear() + 57;
  const bsMonth = gregorianDate.getMonth();
  const bsDay = gregorianDate.getDate();
  return { year: bsYear, month: bsMonth, day: bsDay };
};

// Convert Bikram Sambat to approximate Gregorian
const bikramSambatToGregorian = (
  bsYear: number,
  bsMonth: number,
  bsDay: number
) => {
  const gregorianYear = bsYear - 57;
  return new Date(gregorianYear, bsMonth, bsDay);
};

export function NepaliDatePicker({
  value,
  onChange,
  placeholder,
  className,
}: NepaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const date = new Date(value);
      return gregorianToBikramSambat(date);
    }
    const today = new Date();
    return gregorianToBikramSambat(today);
  });

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      const bsDate = gregorianToBikramSambat(date);
      setCurrentDate(bsDate);
    }
  }, [value]);

  const handleDateSelect = (day: number) => {
    const gregorianDate = bikramSambatToGregorian(
      currentDate.year,
      currentDate.month,
      day
    );
    onChange(gregorianDate.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      let newMonth = prev.month;
      let newYear = prev.year;

      if (direction === "next") {
        newMonth++;
        if (newMonth > 11) {
          newMonth = 0;
          newYear++;
        }
      } else {
        newMonth--;
        if (newMonth < 0) {
          newMonth = 11;
          newYear--;
        }
      }

      return { ...prev, month: newMonth, year: newYear };
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInCurrentMonth = daysInMonth[currentDate.month];

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const isSelected = value && new Date(value).getDate() === day;

      days.push(
        <Button
          key={day}
          variant={isSelected ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 font-normal"
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  const displayValue = value
    ? (() => {
        const date = new Date(value);
        const bsDate = gregorianToBikramSambat(date);
        return `${date.getDate()} ${nepaliMonths[bsDate.month]} ${bsDate.year}`;
      })()
    : placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {nepaliMonths[currentDate.month]} {currentDate.year}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["आ", "सो", "म", "बु", "बि", "श", "श"].map((day) => (
              <div
                key={day}
                className="h-8 w-8 text-center text-xs font-medium text-muted-foreground flex items-center justify-center"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {renderCalendarDays()}
          </div>

          {/* Quick date input */}
          <div className="mt-4 pt-3 border-t">
            <Input
              type="date"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="text-xs"
              placeholder="वा मिति छान्नुहोस्"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
