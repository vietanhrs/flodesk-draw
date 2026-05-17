import { useMemo, useState } from "react";

import {
  Arrange,
  Box,
  Flex,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  Text,
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

const menuShellProps = {
  flex: "0 0 auto" as const,
  minHeight: 0,
  backgroundColor: "background" as const,
  borderColor: "border" as const,
  borderWidth: "1px" as const,
  borderSide: "right" as const,
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
        <Box flex="1 1 auto">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elements"
            aria-label="Search elements"
            icon={<IconSearch width={16} height={16} />}
            size="m"
          />
        </Box>
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
