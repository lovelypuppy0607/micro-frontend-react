import React, { useEffect, useState } from 'react';
import axios from "axios";

import io from 'socket.io-client';

const socket = io("/", { path: "/socket", autoConnect: false });
socket.on("connect", () => {
  console.log(socket.id);
});
socket.on("hello", (...args) => {
  console.log("hello", args)
})
socket.connect();

export const App: React.FC = () => {
  const [servicesConfig, serServicesConfig] = useState<{ [key: string]: { port: number; publicPath: string } }>({});
  const [servicesState, serServicesState] = useState<{ [key: string]: { status: "stopped" | "run" } }>({})

  useEffect(() => {
    axios.get("/api/services/config").then(({ data }) => serServicesConfig(data));
    axios.get("/api/services/state").then(({ data }) => serServicesState(data));
  }, []);

  return (
    <div>
      {Object.entries(servicesConfig).map(([serviceKey, { port, publicPath }]) => (
        <div key={serviceKey} style={{ display: "flex" }}>
          <div style={{ margin: "0 48px 0 0 " }}>
            <span>Service key: </span>
            <span>{serviceKey}</span>
          </div>
          <div style={{ margin: "0 48px 0 0 " }}>
            <span>Port: </span>
            <span>{port}</span>
          </div>
          <div style={{ margin: "0 48px 0 0 " }}>
            <span>Public path: </span>
            <span>{publicPath}</span>
          </div>
          <div style={{ margin: "0 48px 0 0 " }}>
            <span>State: </span>
            <span>{servicesState[serviceKey] && servicesState[serviceKey].status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
