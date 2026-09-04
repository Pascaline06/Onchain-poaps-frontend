// ABI for OnchainPOAPs — copied verbatim from the compiled contract.
// DO NOT hand-edit; regenerate from onchain-poaps/out/Poap.sol/OnchainPOAPs.json if the contract changes.
export const POAP_ABI = [
  {
    type: "function", name: "registerEvent", stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "eventDate", type: "uint256" },
      { name: "location", type: "string" },
      { name: "allowlistRoot", type: "bytes32" },
      { name: "svgImage", type: "string" },
      { name: "externalUrl", type: "string" },
      { name: "flags", type: "uint8" },
    ],
    outputs: [{ name: "eventId", type: "uint256" }],
  },
  {
    type: "function", name: "mint", stateMutability: "nonpayable",
    inputs: [{ name: "eventId", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "allowlistMint", stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "merkleProof", type: "bytes32[]" },
    ], outputs: [],
  },
  {
    type: "function", name: "mintWithSignature", stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "signature", type: "bytes" },
    ], outputs: [],
  },
  {
    type: "function", name: "creatorMint", stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "recipients", type: "address[]" },
    ], outputs: [],
  },
  {
    type: "function", name: "updateAllowlistRoot", stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "newRoot", type: "bytes32" },
    ], outputs: [],
  },
  {
    type: "function", name: "updateEventPublic", stateMutability: "nonpayable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "isPublic", type: "bool" },
    ], outputs: [],
  },
  {
    type: "function", name: "events", stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "eventDate", type: "uint256" },
      { name: "location", type: "string" },
      { name: "allowlistRoot", type: "bytes32" },
      { name: "svgImage", type: "address" },
      { name: "creator", type: "address" },
      { name: "createdAt", type: "uint256" },
      { name: "externalUrl", type: "string" },
      { name: "isSoulbound", type: "bool" },
      { name: "isPublic", type: "bool" },
    ],
  },
  {
    type: "function", name: "hasClaimed", stateMutability: "view",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "account", type: "address" },
    ], outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "totalEvents", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "uri", stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ], outputs: [{ name: "", type: "uint256" }],
  },
  {
    // Inherited from OpenZeppelin's ERC1155Supply — the contract extends it,
    // giving us an exact live per-event mint count for free, no log indexing.
    type: "function", name: "totalSupply", stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "getMultichainEventId", stateMutability: "view",
    inputs: [{ name: "eventId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function", name: "CREATOR_TIMELOCK", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event", name: "NewEvent", anonymous: false,
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "creator", type: "address", indexed: true },
    ],
  },
  {
    type: "event", name: "NewMint", anonymous: false,
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "recipient", type: "address", indexed: true },
    ],
  } as const,
  {
    type: "event", name: "AllowlistUpdated", anonymous: false,
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "newRoot", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event", name: "EventPublicUpdated", anonymous: false,
    inputs: [
      { name: "eventId", type: "uint256", indexed: true },
      { name: "isPublic", type: "bool", indexed: false },
    ],
  },
] as const;

export const NEW_MINT_EVENT = POAP_ABI.find(
  (item): item is Extract<(typeof POAP_ABI)[number], { type: "event"; name: "NewMint" }> =>
    item.type === "event" && item.name === "NewMint"
)!;
