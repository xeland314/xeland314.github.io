let term;
let worker;
let resizeListener;
let sab;
let lock;
let currentMode = "shell"; // 'shell' or 'wasm'
let shellBuffer = "";

// Commands registry
const commands = {};

document.addEventListener("astro:page-load", async () => {
  const container = document.getElementById("terminal-container");
  if (!container) return;

  // Dynamically import xterm to avoid potential build-time transform issues
  const { Terminal } = await import("@xterm/xterm");

  // Load available WASM commands
  const wasmUrl = container.dataset.wasmUrl;
  if (wasmUrl) {
    commands["calculadora"] = wasmUrl;
  }

  const fastfetchUrl = container.dataset.fastfetchWasmUrl;
  if (fastfetchUrl) {
    commands["fastfetch"] = fastfetchUrl;
  }

  // Check for SharedArrayBuffer support
  if (typeof SharedArrayBuffer === "undefined") {
    container.innerHTML = `
        <div class="p-4 text-red-500 font-mono">
          Error: SharedArrayBuffer is not supported. <br>
          Please ensure the site is served with the following headers:<br>
          Cross-Origin-Embedder-Policy: require-corp<br>
          Cross-Origin-Opener-Policy: same-origin
        </div>
      `;
    return;
  }

  // Cleanup previous instance if any
  if (term) term.dispose();
  if (worker) worker.terminate();
  if (resizeListener) window.removeEventListener("resize", resizeListener);

  term = new Terminal({
    cursorBlink: true,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 14,
    theme: {
      background: "#1a1b26",
      foreground: "#c0caf5",
    },
  });

  term.open(container);

  const fitTerminal = () => {
    if (!container || !term) return;
    const charWidth = 9;
    const charHeight = 17;
    const cols = Math.floor(container.clientWidth / charWidth);
    const rows = Math.floor(container.clientHeight / charHeight);
    term.resize(cols, rows);
  };

  fitTerminal();
  resizeListener = fitTerminal;
  window.addEventListener("resize", resizeListener);

  term.writeln("\x1b[32mWelcome to Xeland314 Portfolio Terminal\x1b[0m");
  term.writeln('Type "help" to see available commands.');
  prompt();

  function prompt() {
    term.write("\r\n\x1b[1;34mvisitor@portfolio\x1b[0m:\x1b[1;32m~\x1b[0m$ ");
  }

  function runWasm(url) {
    currentMode = "wasm";

    // Setup SharedArrayBuffer for this run
    sab = new SharedArrayBuffer(1024);
    lock = new Int32Array(sab);

    worker = new Worker("/scripts/wasi_worker.js");
    worker.postMessage({ wasmUrl: url, sab });

    worker.onmessage = (e) => {
      const { type, data, code } = e.data;
      if (type === "output") {
        term.write(data.replace(/(?<!\r)\n/g, "\r\n"));
      } else if (type === "exit") {
        if (worker) {
          worker.terminate();
          worker = null;
        }
        currentMode = "shell";
        if (code !== 0) {
          term.writeln(`\r\n\x1b[31mProcess exited with code ${code}\x1b[0m`);
        }
        prompt();
      }
    };

    worker.onerror = (err) => {
      // Ignore the error if it's the expected exit mechanism
      if (err.message && err.message.includes("Process exited with code")) {
        return;
      }

      term.writeln(`\r\n\x1b[31mWorker Error: ${err.message}\x1b[0m`);

      if (worker) {
        worker.terminate();
        worker = null;
      }
      currentMode = "shell";
      prompt();
    };
  }

  // Handle Input
  term.onData((data) => {
    const ord = data.charCodeAt(0);

    if (currentMode === "shell") {
      if (ord === 13) {
        // Enter
        term.write("\r\n");
        handleShellCommand(shellBuffer.trim());
        shellBuffer = "";
      } else if (ord === 127) {
        // Backspace
        if (shellBuffer.length > 0) {
          shellBuffer = shellBuffer.slice(0, -1);
          term.write("\b \b");
        }
      } else if (ord < 32) {
        // Ignore controls
      } else {
        shellBuffer += data;
        term.write(data);
      }
    } else {
      // WASM Mode
      // Local echo logic is handled by 'terminal.astro' (user preference or app?)
      // Usually canonical mode echoes locally.

      if (ord === 13) {
        // Enter
        term.write("\r\n");
        // Append \n for WASI input
        sendToWorker(data); // Sending \r (13) might be issue?
        // The logic below sends raw char but we want to emulate terminal
        // Previous working logic accumulated line.

        // Let's reuse the line buffer logic for WASM too?
        // If we do char-by-char, we can just send.
        // But for line editing (backspace), we need buffer.
      } else if (ord === 127) {
        // Handle backspace visually?
        // If we are in WASM mode, do we handle line editing?
        // Yes, we implemented canonical mode previously.
      }

      // Actually, let's reuse the previous logic which had a 'currentLine' buffer
      handleWasmInput(ord, data);
    }
  });

  let wasmLineBuffer = "";

  function handleWasmInput(ord, char) {
    if (ord === 13) {
      term.write("\r\n");
      wasmLineBuffer += "\n";
      sendToWorker(wasmLineBuffer);
      wasmLineBuffer = "";
    } else if (ord === 127) {
      if (wasmLineBuffer.length > 0) {
        wasmLineBuffer = wasmLineBuffer.slice(0, -1);
        term.write("\b \b");
      }
    } else if (ord < 32) {
      // ignore
    } else {
      wasmLineBuffer += char;
      term.write(char);
    }
  }

  function handleShellCommand(cmd) {
    if (!cmd) {
      prompt();
      return;
    }

    const args = cmd.split(" ");
    const command = args[0];

    if (command === "help") {
      term.writeln("Available commands:");
      term.writeln("  help         - Show this help message");
      term.writeln("  clear        - Clear the terminal screen");
      Object.keys(commands).forEach((c) => {
        term.writeln(`  ${c}  - Run ${c}`);
      });
      prompt();
    } else if (command === "clear") {
      term.clear();
      prompt();
    } else if (commands[command]) {
      runWasm(commands[command]);
    } else {
      term.writeln(`Command not found: ${command}`);
      prompt();
    }
  }

  let inputBuffer = [];
  let isProcessing = false;

  async function sendToWorker(str) {
    for (let i = 0; i < str.length; i++) {
      inputBuffer.push(str.charCodeAt(i));
    }
    processBuffer();
  }

  function processBuffer() {
    if (isProcessing) return;
    if (inputBuffer.length === 0) return;
    if (!worker) return; // safety

    if (Atomics.load(lock, 0) === 0) {
      isProcessing = true;
      const charCode = inputBuffer.shift();

      lock[1] = charCode;
      Atomics.store(lock, 0, 1);
      Atomics.notify(lock, 0);

      isProcessing = false;

      if (inputBuffer.length > 0) {
        setTimeout(processBuffer, 0);
      }
    } else {
      setTimeout(processBuffer, 10);
    }
  }
});

document.addEventListener("astro:before-swap", () => {
  if (term) {
    term.dispose();
    term = null;
  }
  if (worker) {
    worker.terminate();
    worker = null;
  }
  if (resizeListener) {
    window.removeEventListener("resize", resizeListener);
    resizeListener = null;
  }
});

