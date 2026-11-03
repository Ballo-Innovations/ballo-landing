"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Slot } from "@/lib/demoBooking/shared";
import { ZAMBIA_TZ } from "@/lib/demoBooking/shared";
import { formatDayParts, formatTime, groupSlotsByDay, sameOffsets, zoneLabel } from "@/lib/demoBooking/time";

type Props = {
  slots: Slot[];
  visitorTimeZone: string;
  displayTimeZone: string;
  onDisplayTimeZoneChange: (tz: string) => void;
  selectedStart: string | null;
  onSelect: (slot: Slot) => void;
  /** Id prefix so two pickers never share ids. */
  idPrefix: string;
};

/**
 * Arrow-key movement for a row of radio-like buttons with one tab stop
 * (roving tabindex). Returns the index to focus, or null to ignore the key.
 */
function nextIndex(key: string, index: number, count: number, columns = 1): number | null {
  switch (key) {
    case "ArrowRight":
      return Math.min(count - 1, index + 1);
    case "ArrowLeft":
      return Math.max(0, index - 1);
    case "ArrowDown":
      return columns > 1 ? Math.min(count - 1, index + columns) : Math.min(count - 1, index + 1);
    case "ArrowUp":
      return columns > 1 ? Math.max(0, index - columns) : Math.max(0, index - 1);
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

export function SlotPicker({
  slots,
  visitorTimeZone,
  displayTimeZone,
  onDisplayTimeZoneChange,
  selectedStart,
  onSelect,
  idPrefix,
}: Props) {
  const days = useMemo(() => groupSlotsByDay(slots, displayTimeZone), [slots, displayTimeZone]);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep a valid day selected: the one holding the chosen slot, else the first day.
  useEffect(() => {
    if (days.length === 0) {
      setDayKey(null);
      return;
    }
    const withSelection = selectedStart
      ? days.find((d) => d.slots.some((s) => s.start === selectedStart))
      : undefined;
    if (withSelection) {
      setDayKey(withSelection.key);
      return;
    }
    setDayKey((current) => (current && days.some((d) => d.key === current) ? current : days[0].key));
  }, [days, selectedStart]);

  const activeDayIndex = Math.max(0, days.findIndex((d) => d.key === dayKey));
  const activeDay = days[activeDayIndex];
  const instants = useMemo(() => slots.map((s) => s.start), [slots]);
  const visitorIsZambia = sameOffsets(visitorTimeZone, ZAMBIA_TZ, instants);
  const showingZambia = displayTimeZone === ZAMBIA_TZ;

  const selectedIndexInDay = activeDay ? activeDay.slots.findIndex((s) => s.start === selectedStart) : -1;
  const timeTabStop = selectedIndexInDay >= 0 ? selectedIndexInDay : 0;

  const onDayKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const target = nextIndex(e.key, index, days.length);
    if (target === null) return;
    e.preventDefault();
    setDayKey(days[target].key);
    dayRefs.current[target]?.focus();
    dayRefs.current[target]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const gridColumns = () => {
    const grid = gridRef.current;
    if (!grid) return 1;
    return getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
  };

  const onTimeKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!activeDay) return;
    const target = nextIndex(e.key, index, activeDay.slots.length, gridColumns());
    if (target === null) return;
    e.preventDefault();
    timeRefs.current[target]?.focus();
  };

  if (days.length === 0) return null;

  const dayLabelId = `${idPrefix}-day-label`;
  const timeLabelId = `${idPrefix}-time-label`;

  return (
    <div className="bd-picker">
      <p className="bd-tz">
        30 minutes, shown in {zoneLabel(displayTimeZone)}.
        {!visitorIsZambia && (
          <>
            {" "}
            <button
              type="button"
              className="bd-link-btn"
              onClick={() => onDisplayTimeZoneChange(showingZambia ? visitorTimeZone : ZAMBIA_TZ)}
            >
              {showingZambia ? `Show my time (${zoneLabel(visitorTimeZone)})` : "Show Zambia time"}
            </button>
          </>
        )}
      </p>
      <p id={dayLabelId} className="sr-only">Day</p>
      <div className="bd-days" role="radiogroup" aria-labelledby={dayLabelId}>
        {days.map((d, i) => {
          const parts = formatDayParts(d.key);
          const active = i === activeDayIndex;
          return (
            <button
              key={d.key}
              ref={(el) => { dayRefs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${parts.long}, ${d.slots.length} ${d.slots.length === 1 ? "time" : "times"} free`}
              tabIndex={active ? 0 : -1}
              className={`bd-day ${active ? "bd-day--active" : ""}`}
              onClick={() => setDayKey(d.key)}
              onKeyDown={(e) => onDayKey(e, i)}
            >
              <span className="bd-day__weekday">{parts.weekday}</span>
              <span className="bd-day__num">{parts.day}</span>
              <span className="bd-day__month">{parts.month}</span>
            </button>
          );
        })}
      </div>

      {activeDay && (
        <>
          <p id={timeLabelId} className="bd-picker__label">
            Times on {formatDayParts(activeDay.key).long}
          </p>
          <div ref={gridRef} className="bd-times" role="radiogroup" aria-labelledby={timeLabelId}>
            {activeDay.slots.map((slot, i) => {
              const checked = slot.start === selectedStart;
              return (
                <button
                  key={slot.start}
                  ref={(el) => { timeRefs.current[i] = el; }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={i === timeTabStop ? 0 : -1}
                  className={`bd-time ${checked ? "bd-time--active" : ""}`}
                  onClick={() => onSelect(slot)}
                  onKeyDown={(e) => onTimeKey(e, i)}
                >
                  {formatTime(slot.start, displayTimeZone)}
                </button>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
