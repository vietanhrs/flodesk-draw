import { useMemo, useRef, useState } from "react";

import {
  Arrange,
  Box,
  Flex,
  IconChevronLeft,
  IconChevronRight,
  IconButton,
  IconCross,
  IconSearch,
  Text,
  TextButton,
} from "@flodesk/grain";

import { useDrag } from "@src/pages/Editor/state/DragContext";
import { useEditor } from "@src/pages/Editor/state/EditorContext";
import {
  elementCategories,
  elementDefinitions,
  type ElementDefinition,
} from "@src/pages/Editor/state/elementCatalog";
import { setNewElementDrag } from "@src/pages/Editor/utils/dragData";

const ElementCard = ({ def }: { def: ElementDefinition }) => {
  const Icon = def.icon;
  const { beginDrag, endDrag } = useDrag();
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        setNewElementDrag(e.dataTransfer, def.type);
        beginDrag("new-element");
      }}
      onDragEnd={endDrag}
      aria-label={`Drag to add ${def.name}`}
      title={`Drag to add ${def.name}`}
      className="edt-element-card"
    >
      <Icon width={24} height={24} className="edt-element-card__icon" />
      <span className="edt-element-card__label">{def.name}</span>
    </div>
  );
};

const menuShellProps = {
  flex: "0 0 auto" as const,
  minHeight: 0,
  backgroundColor: "background" as const,
  borderColor: "border" as const,
  borderWidth: "1px" as const,
  borderSide: "right" as const,
};

const ElementSearch = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = () => {
    setIsOpen(true);
    inputRef.current?.focus();
    // Focus again after the open state applies so quick typing keeps every character.
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div
      className={"edt-search" + (isOpen ? " edt-search--open" : "")}
      onBlur={(event) => {
        if (!value && !event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      <div className="edt-search__input-layer" aria-hidden={!isOpen}>
        <div className="edt-search__row">
          <IconSearch width={16} height={16} aria-hidden="true" />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onFocus={openSearch}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              if (value) {
                onChange("");
              } else {
                setIsOpen(false);
              }
            }}
            placeholder="Search..."
            aria-label="Search elements"
            tabIndex={isOpen ? 0 : -1}
            className="edt-search__input"
          />
          {value && (
            <IconButton
              aria-label="Clear search"
              icon={<IconCross width={16} height={16} aria-hidden="true" />}
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
            />
          )}
        </div>
      </div>
      <div className="edt-search__button-layer" aria-hidden={isOpen}>
        <TextButton
          icon={<IconSearch width={16} height={16} aria-hidden="true" />}
          onClick={openSearch}
          tabIndex={isOpen ? -1 : 0}
        >
          Search
        </TextButton>
      </div>
    </div>
  );
};

export const ElementMenu = () => {
  const { isElementMenuOpen, toggleMenu } = useEditor();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>(elementCategories[0].id);

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
      <Flex
        direction="column"
        wrap="nowrap"
        alignItems="center"
        width="36px"
        paddingTop="s2"
        {...menuShellProps}
      >
        <button
          type="button"
          aria-label="Open element menu"
          title="Open element menu"
          onClick={() => toggleMenu(true)}
          className="edt-menu__toggle"
        >
          <IconChevronRight width={16} height={16} />
        </button>
      </Flex>
    );
  }

  return (
    <Flex
      tag="aside"
      aria-label="Element menu"
      direction="column"
      wrap="nowrap"
      alignItems="stretch"
      width="288px"
      {...menuShellProps}
    >
      <Flex
        wrap="nowrap"
        alignItems="center"
        gap="s"
        padding="s2"
        borderColor="border"
        borderWidth="1px"
        borderSide="bottom"
      >
        <Flex flex="1 1 auto" minWidth={0} justifyContent="end">
          <ElementSearch value={search} onChange={setSearch} />
        </Flex>
        <button
          type="button"
          aria-label="Collapse element menu"
          title="Collapse element menu"
          onClick={() => toggleMenu(false)}
          className="edt-menu__toggle"
        >
          <IconChevronLeft width={16} height={16} />
        </button>
      </Flex>

      <Arrange
        columns="120px 1fr"
        gap={0}
        alignItems="stretch"
        flex="1 1 auto"
        minHeight={0}
      >
        <Box
          tag="nav"
          aria-label="Element categories"
          overflowY="auto"
          borderColor="border"
          borderWidth="1px"
          borderSide="right"
        >
          <Box tag="ul" margin={0} padding={0} style={{ listStyle: "none" }}>
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
          </Box>
        </Box>

        <Box overflowY="auto" padding="s2">
          {filtered.length === 0 ? (
            <Text size="s" color="content2">
              No elements match.
            </Text>
          ) : (
            <Arrange
              columns="repeat(2, minmax(0, 1fr))"
              columnGap="s"
              rowGap="s"
            >
              {filtered.map((def) => (
                <ElementCard key={def.type} def={def} />
              ))}
            </Arrange>
          )}
        </Box>
      </Arrange>
    </Flex>
  );
};
