"use client";

import {
    normalizeRequirements,
    ROOM_REQUIREMENT_ITEMS,
    type RoomRequirements,
} from "./Type/WalkInFormConfig";

type RequirementGridProps = {
    value: RoomRequirements;
    onChange: (value: RoomRequirements) => void;
};

const noteClass =
    "h-8 w-full rounded border border-gray-300 bg-white px-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20";

export function RequirementGrid({ value, onChange }: RequirementGridProps) {
    const requirements = normalizeRequirements(value);

    function update(
        room: string,
        item: string,
        patch: Partial<{ selected: boolean; note: string }>
    ) {
        onChange({
            ...requirements,
            [room]: {
                ...requirements[room],
                [item]: {
                    ...requirements[room][item],
                    ...patch,
                },
            },
        });
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(ROOM_REQUIREMENT_ITEMS).map(([room, items]) => (
                <div
                    key={room}
                    className="overflow-hidden rounded-md border border-gray-200 bg-white"
                >
                    <div className="bg-blue-50 px-3 py-2 text-xs font-bold uppercase text-blue-800">
                        {room}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {items.map((item) => {
                            const entry = requirements[room]?.[item] ?? {
                                selected: false,
                                note: "",
                            };
                            return (
                                <div
                                    key={item}
                                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-white px-3 py-1.5 hover:bg-blue-50/30"
                                >
                                    <span className="text-xs text-gray-700">{item}</span>
                                    <input
                                        type="checkbox"
                                        checked={entry.selected}
                                        onChange={(e) =>
                                            update(room, item, {
                                                selected: e.target.checked,
                                            })
                                        }
                                        className="accent-blue-600"
                                    />
                                    <input
                                        value={entry.note ?? ""}
                                        onChange={(e) =>
                                            update(room, item, { note: e.target.value })
                                        }
                                        placeholder="Notes"
                                        className={noteClass}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
