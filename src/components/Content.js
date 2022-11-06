import React, { useState, useMemo, memo, useEffect, useRef } from "react";
import { Col, Drawer, Form, Input, Row, Select, Space } from "antd";
import { useDrop } from "react-dnd";
import tags from "../utils/tags";

const TargetBox = memo(function TargetBox({ onDrop, item, showDrawer }) {
  const ref = useRef(null);
  const [{ isOver, canDrop, isOverCurrent }, drop] = useDrop(() => {
    return {
      accept: tags.map((i) => `${i.id}`),
      drop(_item, monitor) { // 拖动结束
        // 是否可以拖动，通过accept判断
        const didDrop = monitor.didDrop();
        if (didDrop) {
          return;
        }
        // 拖动结束后去除区分位置的线条
        removeHr();
        // 拖动结束的回调
        onDrop(monitor.getItem(), item);
        return undefined;
      },
      collect: (monitor) => {
        // 是否是当前所在的可存放拖拽元素的盒子
        const isOverCurrent = monitor.isOver({ shallow: true });
        // 不是的话如果有区分位置的线条也需要移除
        if (!isOverCurrent) {
          removeHr();
        }
        return {
          isOver: monitor.isOver(),
          isOverCurrent,
          canDrop: monitor.canDrop()
        }
      },
      hover(it, monitor) {
        if (!ref.current) return;
        const isOverCurrent = monitor.isOver({ shallow: true });
        if (!isOverCurrent) return;
        const clientOffset = monitor.getClientOffset();
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const childs = ref.current.children;
        const realEleList = Array.from(childs).filter(i => i.id !== `${item.hierarchy}_hr`);
        if (!realEleList.length) {
          addHrDom();
        } else {
          const xPos = new Set(realEleList.map(i => i.getBoundingClientRect().y));
          realEleList.forEach((sit, idx) => {
            const pos = sit.getBoundingClientRect();
            const posW = pos.x + pos.width;
            const posH = pos.y + pos.height;
            if (realEleList[idx + 1]) {
              const posNext = realEleList[idx + 1].getBoundingClientRect();
              const posWNext = posNext.x + posNext.width;
              const posHNext = posNext.y + posNext.height;
              if ((posH > clientOffset.y && clientOffset.y > posHNext)
                || (posW > clientOffset.x && clientOffset.x > posWNext)) {
                console.log('在下面222');
                addHrDom(sit);
              } else if ((posH < clientOffset.y && clientOffset.y < posHNext)
                || (posW < clientOffset.x && clientOffset.x < posWNext)) {
                console.log('在上面222');
                addHrDom(idx === realEleList.length - 1 ? null : realEleList[idx + 1]);
              }
            } else if (!idx || idx === realEleList.length - 1) {
              if (posH > clientOffset.y || posW < clientOffset.x) {
                console.log('在下面', sit, idx);
                addHrDom(sit);
              } else if (posH < clientOffset.y || posW > clientOffset.x) {
                console.log('在上面', idx);
                addHrDom(idx === realEleList.length - 1 ? null : realEleList[idx + 1]);
              }
            }
          })
        }
      }
    };
  }, [onDrop]);

  const opacity = isOver ? 1 : 0.7;
  const color = isOverCurrent ? '#008cff' : 'gray';
  const style = canDrop
    ? {
      border: `1px dashed ${color}`,
      padding: "10px",
      margin: "10px",
      boxShadow: "0px 0px 4px #ccc"
    }
    : {
      border: `1px dashed ${color}`,
      padding: "10px",
      margin: "10px"
    };

  // 移除拖拽过程中用于标识位置的hr标签
  function removeHr() {
    const hrEle = document.getElementById(`${item.hierarchy}_hr`);
    if (hrEle) {
      hrEle.remove();
    }
  }

  // 添加拖拽过程中用于标识位置的hr标签
  function addHrDom(beforeEle) {
    const cur = document.getElementById(`${item.hierarchy}_hr`);
    if (cur) return;
    const ele = document.createElement('hr');
    ele.style = 'width: auto;height: auto;margin: 0;background: red;';
    ele.setAttribute('id', `${item.hierarchy}_hr`);
    if (beforeEle) {
      ref.current.insertBefore(ele, beforeEle);
    } else {
      ref.current.appendChild(ele);
    }
  }

  // 判断一个节点中子元素的排列是垂直还是水平
  function judgeDirection(list) {
    let result = '';
    const xPos = list.map(i => i.getBoundingClientRect().x);
    const yPos = list.map(i => i.getBoundingClientRect().y);
    const sortFlagX = isSort(xPos);
    const sortFlagY = isSort(yPos);
    if (sortFlagX && !sortFlagY) {
      result = 'hor'; // 水平
    } else if (!sortFlagX && sortFlagY) {
      result = 'ver'; // 垂直
    } else {
      list.map(it => {
        const pos = it.getBoundingClientRect();
        return
      })
    }
    return result;
  }

  function isSort(list) {
    let flag = true;
    list.forEach((it, idx) => {
      if (idx < list.length - 1) {
        if (it > list[idx + 1]) {
          flag = false;
        }
      }
    })
    return flag;
  }

  drop(ref)

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        showDrawer(item.hierarchy);
      }}
      style={{ ...style, opacity, ...item.style, cursor: "pointer" }}
    >
      {(item.children || []).map((it) => (
        <TargetBox
          key={it.hierarchy}
          onDrop={onDrop}
          item={it}
          showDrawer={showDrawer}
        />
      ))}
    </div>
  );
});

function Content() {
  const [layoutJson, setLayoutJson] = useState([
    {
      hierarchy: "0",
      tagName: "div",
      style: { width: "100%" },
      children: []
    }
  ]);
  const [open, setOpen] = useState(false);
  const [drawerHier, setDrawerHier] = useState("0");

  const showDrawer = (hier) => {
    setDrawerHier(hier);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleDrop = (item, { hierarchy, hasCut }) => {
    if (hasCut) return;
    const list = [...layoutJson];
    let arr = list;
    const indexs = hierarchy.split("-").map((i) => Number(i));
    indexs.forEach((it, idx) => {
      if (idx) {
        arr = arr.children[it];
      } else {
        arr = list[it];
      }
    });
    if (!Array(arr.children)) {
      arr.children = [];
    }
    arr.children.push({
      hierarchy: `${hierarchy}-${arr.children.length}`,
      tagName: item.tagName,
      hasCut: item.hasCut,
      style: item.style || {},
      children: []
    });

    setLayoutJson(list);
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100%",
        marginLeft: 16,
        background: "rgba(255,255,255,0.8)"
      }}
    >
      {layoutJson.map((it) => (
        <TargetBox
          key={it.hierarchy}
          onDrop={handleDrop}
          item={it}
          showDrawer={showDrawer}
        />
      ))}
      <Drawer
        title="Create a new account"
        width={420}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter user name" }]}
              >
                <Input placeholder="Please enter user name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="url"
                label="Url"
                rules={[{ required: true, message: "Please enter url" }]}
              >
                <Input
                  style={{ width: "100%" }}
                  addonBefore="http://"
                  addonAfter=".com"
                  placeholder="Please enter url"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  {
                    required: true,
                    message: "please enter url description"
                  }
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="please enter url description"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
}

export default Content;
