"use client";

import { createConfig, http, injected } from "wagmi";
import { morphHoodi, morphMainnet } from "./morph";

export const wagmiConfig = createConfig({
  chains: [morphHoodi, morphMainnet],
  transports: {
    [morphHoodi.id]: http(),
    [morphMainnet.id]: http(),
  },
  connectors: [injected()],
});
