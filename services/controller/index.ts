import express from "express";
import * as http from "http";
import axios from "axios";
import { Server } from 'socket.io';

import { getServicesConfig } from "../../libs/settings";

const servicesConfig = getServicesConfig();

type ServiceConfig = typeof servicesConfig;

type ServiceState = {
  status: "stopped" | "run";
  port?: number;
  publicPath?: string;
};

const servicesState: { [Key in keyof ServiceConfig]?: ServiceState } = {};
const port = process.env.PORT || servicesConfig.controller.port;
const app = express();

const server = http.createServer(app);
const io = new Server(server, { path: "/socket" });

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on("disconnect", (reason) => {
    console.log('a user disconnected');
  });
});

app.use(express.json());

app.get("/api/services/config", (req, res) => {
  res.send(getServicesConfig());
  res.end();
});

app.get("/api/services/config/:serviceKey", (req, res) => {
  const { params } = req;
  const { serviceKey } = params;

  if (typeof serviceKey === "string") {
    res.send(getServicesConfig()[serviceKey] ?? null);
  } else {
    res.send(getServicesConfig());
  }

  res.end();
});

app.get("/api/services/state", (req, res) => {
  res.send(servicesState);
  res.end();
});

app.get("/api/services/state/:serviceKey", (req, res) => {
  const { params } = req;
  const { serviceKey } = params;

  if (typeof serviceKey === "string") {
    res.send(servicesState[serviceKey]);
  } else {
    res.send(servicesState);
  }

  res.end();
});

app.post("/api/services/run", (req, res) => {
  console.log("run", req.body);

  const { serviceKey } = req.body;

  if (serviceKey) {
    servicesState[serviceKey] = { status: "run" };
    io.emit("services/run", { serviceKey });
    res.status(200);
  } else {
    res.status(400);
  }

  res.end();
});

app.post("/api/services/stopped", (req, res) => {
  console.log("stopped", req.body);

  const { serviceKey } = req.body;

  if (serviceKey) {
    servicesState[serviceKey] = { status: "stopped" };
    io.emit("services/stopped", { serviceKey });
    res.status(200);
  } else {
    res.status(400);
  }

  res.end();
});

app.get("*", (req, res) => {
  res.send("Server app");
  res.end();
});

server.listen(port, () => {
  console.log(`http://localhost:${port}`);

  const serviceConfig: Record<keyof ServiceConfig, ServiceConfig[keyof ServiceConfig]> = getServicesConfig();

  Object.entries(serviceConfig).forEach(([serviceKey, config]) => {
    axios.get(`http://localhost:${config.port}`).then(() => {
      servicesState[serviceKey] = { status: "run" };
    }).catch(() => {
      servicesState[serviceKey] = { status: "stopped" };
    });
  });
});