import asyncio
import json
import os
import sys
import base64
import websockets
import urllib.request
import subprocess
import time

PORT = 9222
EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
HTML_URL = "http://localhost:8000/compile-mind.html"

async def run_cdp():
    # Get WebSocket Debugger URL
    try:
        req = urllib.request.urlopen(f"http://localhost:{PORT}/json")
        targets = json.loads(req.read().decode())
        ws_url = None
        for t in targets:
            if t.get("type") == "page":
                ws_url = t.get("webSocketDebuggerUrl")
                break
        if not ws_url and len(targets) > 0:
            ws_url = targets[0].get("webSocketDebuggerUrl")
    except Exception as e:
        print(f"Error connecting to CDP: {e}")
        return

    print(f"Connecting to CDP: {ws_url}")
    async with websockets.connect(ws_url, max_size=100 * 1024 * 1024) as ws:
        msg_id = 1
        
        async def send(method, params=None):
            nonlocal msg_id
            msg_id += 1
            payload = {"id": msg_id, "method": method}
            if params:
                payload["params"] = params
            await ws.send(json.dumps(payload))
            while True:
                resp = json.loads(await ws.recv())
                if resp.get("id") == msg_id:
                    return resp

        # Enable Page & Runtime
        await send("Page.enable")
        await send("Runtime.enable")

        print("Navigating to compile page...")
        await send("Page.navigate", {"url": HTML_URL})
        await asyncio.sleep(2)

        print("Clicking start button...")
        res = await send("Runtime.evaluate", {
            "expression": "startCompilation();",
            "awaitPromise": False
        })
        print("startCompilation called.")

        # Poll status
        for i in range(120):
            await asyncio.sleep(2)
            eval_res = await send("Runtime.evaluate", {
                "expression": "JSON.stringify({ status: document.getElementById('status-text').textContent, done: !!window._compilationDone })"
            })
            val = eval_res.get("result", {}).get("value", "{}")
            data = json.loads(val)
            print(f"Progress ({i*2}s): {data.get('status')}")
            
            if data.get("done"):
                print("Compilation finished! Fetching exported buffer...")
                b64_res = await send("Runtime.evaluate", {
                    "expression": "window._exportedBufferBase64"
                })
                b64_data = b64_res.get("result", {}).get("value", "")
                out_path = os.path.join("assets", "markers", "targets.mind")
                with open(out_path, "wb") as f:
                    f.write(base64.b64decode(b64_data))
                print(f"Saved targets.mind successfully! Size: {os.path.getsize(out_path)} bytes")
                break
            
            if "Terjadi kegagalan" in data.get("status", ""):
                print("Failed!")
                break

if __name__ == "__main__":
    asyncio.run(run_cdp())
