#!/usr/bin/env node
import {CliCore} from "@tsed/cli-core";
import {config} from "../config";
import {HelloCommand} from "./HelloCommand";

CliCore.bootstrap({
  ...config,
  commands: [
    HelloCommand
  ]
}).catch(console.error);