"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merkleRootHex = merkleRootHex;
const cryptoUtils_1 = require("./cryptoUtils");
/** Tạo Merkle root (SHA-256, left-right concat, order ổn định). */
function merkleRootHex(leavesHex) {
    if (leavesHex.length === 0)
        return (0, cryptoUtils_1.sha256Hex)("[]");
    if (leavesHex.length === 1)
        return leavesHex[0];
    let level = [...leavesHex].sort(); // Sort to ensure stability
    while (level.length > 1) {
        const next = [];
        for (let i = 0; i < level.length; i += 2) {
            const a = level[i];
            const b = level[i + 1] ?? a; // if odd, duplicate last element
            // Concatenate in lexicographical order for stability
            const [L, R] = a < b ? [a, b] : [b, a];
            next.push((0, cryptoUtils_1.sha256Hex)(Buffer.concat([Buffer.from(L, "hex"), Buffer.from(R, "hex")])));
        }
        level = next;
    }
    return level[0];
}
//# sourceMappingURL=merkle.js.map