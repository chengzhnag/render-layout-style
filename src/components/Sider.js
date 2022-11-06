import React, { useState, useMemo, memo, useEffect } from "react";
import { Button, Space, Tag } from "antd";
import { useDrag } from "react-dnd";
import tags from "../utils/tags";

const TagDragItem = memo(function TagDragItem({ item }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: `${item.id}`,
      canDrag: true,
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      }),
      item
    }),
    [item]
  );

  const containerStyle = useMemo(
    () => ({
      opacity: isDragging ? 0.4 : 1,
      cursor: "move"
    }),
    [isDragging]
  );

  return (
    <div style={containerStyle} ref={drag}>
      <Tag style={{ marginRight: 0 }} color={item.color}>
        {item.tagName}
      </Tag>
    </div>
  );
});

function Sider() {
  return (
    <div style={{ padding: 10 }}>
      <Space size={[8, 16]} wrap>
        {tags.map((it) => (
          <TagDragItem key={it.id} item={it} />
        ))}
      </Space>
    </div>
  );
}

export default Sider;
