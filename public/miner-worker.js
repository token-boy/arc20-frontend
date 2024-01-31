importScripts("miner.js");

function reportProcess(sequence) {
  postMessage({
    type: "process",
    sequence: parseInt(sequence),
  });
}

onmessage = async (e) => {
  const { action, params } = e.data;
  if (action === "init") {
    await wasm_bindgen("miner_bg.wasm");
    postMessage({ type: "inited" });
  } else if (action === "run") {
    const result = wasm_bindgen.mine(JSON.stringify(params));
    postMessage({
      type: "foundSolution",
      result: JSON.parse(result),
    });
  }
};
