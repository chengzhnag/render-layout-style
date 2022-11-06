import { Button, Layout } from "antd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SiderCom from "./components/Sider";
import ContentCom from "./components/Content";
import "./App.css";

const { Header, Footer, Sider, Content } = Layout;

function App() {
  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <Layout style={{ height: "100%" }}>
          <Sider
            width={240}
            style={{ background: "#fff", borderRight: "1px solid #f5f5f5" }}
          >
            <SiderCom />
          </Sider>
          <Layout>
            <Content>
              <ContentCom />
            </Content>
          </Layout>
        </Layout>
      </DndProvider>
    </div>
  );
}

export default App;
