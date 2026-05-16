import { useMemo, useState } from "react";

import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  TextInput,
} from "@flodesk/grain";

import { useEditor } from "../../state/EditorContext";
import {
  elementCategories,
  elementDefinitions,
  type ElementDefinition,
} from "../../state/elementCatalog";
import { setNewElementDrag } from "../../utils/dragData";

const ElementCard = ({ def }: { def: ElementDefinition }) => {
  const Icon = def.icon;
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => setNewElementDrag(e.dataTransfer, def.type)}
      aria-label={`Drag to add ${def.name}`}
      title={`Drag to add ${def.name}`}
      className={[
        "group flex flex-col items-center justify-center gap-2 p-3 rounded-md",
        "bg-background border border-border hover:border-blue9 hover:shadow-s",
        "cursor-grab active:cursor-grabbing font-flodesk text-shade13",
        "transition-colors text-center min-h-22",
      ].join(" ")}
    >
      <Icon
        width={24}
        height={24}
        className="text-content2 group-hover:text-shade13"
      />
      <span className="text-xs leading-tight">{def.name}</span>
    </div>
  );
};

export const ElementMenu = () => {
  const { isElementMenuOpen, toggleMenu } = useEditor();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>(
    elementCategories[0].id
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return elementDefinitions.filter((def) => {
      const matchesCategory = !query
        ? def.category === categoryId
        : true;
      const matchesQuery = query
        ? def.name.toLowerCase().includes(query)
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [search, categoryId]);

  if (!isElementMenuOpen) {
    return (
      <div className="flex-none w-9 border-r border-border bg-background flex items-start justify-center pt-3">
        <button
          type="button"
          aria-label="Open element menu"
          title="Open element menu"
          onClick={() => toggleMenu(true)}
          className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-shade2 text-shade13"
        >
          <IconChevronRight width={16} height={16} />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Element menu"
      className="flex-none w-72 border-r border-border bg-background flex flex-col min-h-0"
    >
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border">
        <div className="flex-1">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements"
            aria-label="Search elements"
            icon={<IconSearch width={16} height={16} />}
            size="m"
          />
        </div>
        <button
          type="button"
          aria-label="Collapse element menu"
          title="Collapse element menu"
          onClick={() => toggleMenu(false)}
          className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-shade2 text-shade13"
        >
          <IconChevronLeft width={16} height={16} />
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[7.5rem_1fr]">
        <nav
          aria-label="Element categories"
          className="border-r border-border overflow-y-auto"
        >
          <ul className="list-none p-0 m-0 flex flex-col">
            {elementCategories.map((cat) => {
              const isActive = !search && cat.id === categoryId;
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setCategoryId(cat.id);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "w-full text-left font-flodesk text-body px-3 py-2.5",
                      isActive
                        ? "bg-shade2 text-shade13 font-medium"
                        : "text-content2 hover:text-shade13 hover:bg-shade1",
                    ].join(" ")}
                  >
                    {cat.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <p className="text-content2 text-sm font-flodesk m-0">
              No elements match.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((def) => (
                <ElementCard key={def.type} def={def} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
