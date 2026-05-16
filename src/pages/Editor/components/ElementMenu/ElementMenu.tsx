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
      className="edt-element-card"
    >
      <Icon
        width={24}
        height={24}
        className="edt-element-card__icon"
      />
      <span className="edt-element-card__label">{def.name}</span>
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
      const matchesCategory = !query ? def.category === categoryId : true;
      const matchesQuery = query
        ? def.name.toLowerCase().includes(query)
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [search, categoryId]);

  if (!isElementMenuOpen) {
    return (
      <div className="edt-menu edt-menu--collapsed">
        <button
          type="button"
          aria-label="Open element menu"
          title="Open element menu"
          onClick={() => toggleMenu(true)}
          className="edt-menu__toggle"
        >
          <IconChevronRight width={16} height={16} />
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="Element menu" className="edt-menu">
      <div className="edt-menu__header">
        <div className="edt-menu__search">
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
          className="edt-menu__toggle"
        >
          <IconChevronLeft width={16} height={16} />
        </button>
      </div>

      <div className="edt-menu__columns">
        <nav aria-label="Element categories" className="edt-menu__categories">
          <ul>
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
                    className={
                      "edt-menu__category" +
                      (isActive ? " edt-menu__category--active" : "")
                    }
                  >
                    {cat.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="edt-menu__grid-wrap">
          {filtered.length === 0 ? (
            <p className="edt-menu__empty">No elements match.</p>
          ) : (
            <div className="edt-menu__grid">
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
