import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const raw = await readFile(new URL("../product-contract.json", import.meta.url), "utf8");
const contract = JSON.parse(raw);

assert.equal(contract.schema, "toaster-lab/product-contract/v1");
assert.equal(contract.product, "Crazy Slots");
assert.equal(contract.role, "proposal-appliance");
assert.deepEqual(contract.primaryInputs, ["song", "art", "lyrics"]);
assert.equal(contract.primaryAction, "generate-one-proposal");
assert.equal(contract.primaryOutput, "toaster-lab/proposal-transfer/v1");
assert.equal(contract.modelRole, "creative-proposal-only");
assert.equal(contract.ui.chat, false);
assert.equal(contract.ui.proposalGallery, false);
assert.equal(contract.ui.proposalCountPerPull, 1);
assert.equal(contract.lyrics.mustPreserveText, true);
assert.equal(contract.lyrics.mustNotInventMissingText, true);
assert.equal(contract.lyrics.timingMustBeMonotonic, true);
assert.equal(contract.lyrics.timingMustStayWithinAudioDuration, true);
assert.deepEqual(contract.lyrics.timingSources, ["provided", "derived", "estimated", "unknown"]);

for (const ownership of [
  "admission",
  "canonical addressing",
  "six-up diversity",
  "mutation",
  "preview",
  "timeline resolution",
  "render",
]) {
  assert.ok(
    contract.hauntedToasterOwns.includes(ownership),
    `Haunted Toaster ownership must include ${ownership}`,
  );
}

for (const forbidden of [
  "canonical score address",
  "resolved timeline",
  "execution state",
  "protocol validity",
  "Haunted Toaster admission",
]) {
  assert.ok(
    contract.modelMustNotOwn.includes(forbidden),
    `Gemini boundary must forbid ownership of ${forbidden}`,
  );
}

assert.match(contract.stopCondition, /one validated downloadable proposal/i);

console.log(JSON.stringify({
  proof: "Crazy Slots product boundary is explicit and machine-readable",
  inputCount: contract.primaryInputs.length,
  proposalsPerPull: contract.ui.proposalCountPerPull,
  output: contract.primaryOutput,
  chat: contract.ui.chat,
}, null, 2));
