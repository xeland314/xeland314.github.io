import React from "react";
import type { TimelineSlideData, TimelineEvent } from "../types";
import { Input, Textarea } from "../FormField";
import type { EditorProps } from "../FormField";

export const TimelineEditor: React.FC<EditorProps<TimelineSlideData>> = ({
  slide,
  updateSlide,
}) => (
  <div className="space-y-4">
    <Input
      label="Título"
      value={slide.title}
      onChange={(v) => updateSlide(slide.id, { title: v })}
    />
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-500 uppercase">Eventos</label>
        <button
          onClick={() =>
            updateSlide(slide.id, {
              events: [
                ...slide.events,
                { date: "2024", title: "Nuevo Evento", description: "Descripción..." },
              ],
            })
          }
          className="text-[10px] bg-blue-500 text-white px-2 py-1 rounded font-bold"
        >
          + AÑADIR
        </button>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {slide.events.map((event, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3 relative group"
          >
            <button
              onClick={() =>
                updateSlide(slide.id, {
                  events: slide.events.filter((_, i) => i !== idx),
                })
              }
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
            >
              ✕
            </button>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Input
                  label="Fecha"
                  value={event.date}
                  onChange={(v) => {
                    const newEvents = [...slide.events];
                    newEvents[idx] = { ...newEvents[idx], date: v };
                    updateSlide(slide.id, { events: newEvents });
                  }}
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="Título"
                  value={event.title}
                  onChange={(v) => {
                    const newEvents = [...slide.events];
                    newEvents[idx] = { ...newEvents[idx], title: v };
                    updateSlide(slide.id, { events: newEvents });
                  }}
                />
              </div>
            </div>
            <Textarea
              label="Descripción"
              value={event.description}
              onChange={(v) => {
                const newEvents = [...slide.events];
                newEvents[idx] = { ...newEvents[idx], description: v };
                updateSlide(slide.id, { events: newEvents });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);
