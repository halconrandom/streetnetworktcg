import { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Collection } from "./components/Collection";
import { PackOpener } from "./components/PackOpener";
import { Store } from "./components/Store";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && <Dashboard />}
      {activeTab === "collection" && <Collection />}
      {activeTab === "packs" && <PackOpener />}
      {activeTab === "store" && <Store />}
    </Layout>
  );
}
