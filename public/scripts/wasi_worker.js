
self.onmessage = async (e) => {
  const { wasmUrl, sab } = e.data;
  const lock = new Int32Array(sab);
  const buffer = new Uint8Array(sab);

  const enc = new TextEncoder();
  const dec = new TextDecoder();

  let instance;

  const imports = {
    wasi_snapshot_preview1: {
      fd_write: (fd, iovs_ptr, iovs_len, nwritten_ptr) => {
        let written = 0;
        const memory = new Uint8Array(instance.exports.memory.buffer);
        const view = new DataView(instance.exports.memory.buffer);

        for (let i = 0; i < iovs_len; i++) {
          const ptr = view.getUint32(iovs_ptr + i * 8, true);
          const len = view.getUint32(iovs_ptr + i * 8 + 4, true);

          const chunk = memory.subarray(ptr, ptr + len);
          const string = dec.decode(chunk);
          self.postMessage({ type: 'output', data: string });

          written += len;
        }

        view.setUint32(nwritten_ptr, written, true);
        return 0; // Success
      },
      fd_read: (fd, iovs_ptr, iovs_len, nread_ptr) => {
        // Only handle stdin (0)
        if (fd !== 0) return 0;

        const view = new DataView(instance.exports.memory.buffer);
        const memory = new Uint8Array(instance.exports.memory.buffer);
        let totalRead = 0;

        for (let i = 0; i < iovs_len; i++) {
          const ptr = view.getUint32(iovs_ptr + i * 8, true);
          const len = view.getUint32(iovs_ptr + i * 8 + 4, true);

          // Read loop (1 char at a time for simplicity via SAB)
          // Ideally we'd read up to 'len' bytes
          for (let j = 0; j < len; j++) {
            // Wait for data
            // lock[0]: 0 = empty, 1 = data ready
            Atomics.wait(lock, 0, 0);

            // Read byte
            const charCode = lock[1];

            memory[ptr + j] = charCode;
            totalRead++;

            // Reset lock
            lock[0] = 0;
            Atomics.notify(lock, 0); // Notify main thread that we read it

            // If newline, maybe return? 
            // Standard canonical mode usually returns on newline.
            if (charCode === 10 || charCode === 13) {
              view.setUint32(nread_ptr, totalRead, true);
              return 0;
            }
          }
        }

        view.setUint32(nread_ptr, totalRead, true);
        return 0;
      },
      fd_seek: () => 70, // ESPIPE
      fd_close: () => 0,
      fd_fdstat_get: (fd, stat_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        view.setUint8(stat_ptr, 16); // filetype: character device
        view.setUint16(stat_ptr + 2, 0, true); // flags
        // rights base and inheriting (all rights - set to -1 biguint64)
        // 0xFFFFFFFFFFFFFFFF
        view.setBigUint64(stat_ptr + 8, BigInt("-1"), true);
        view.setBigUint64(stat_ptr + 16, BigInt("-1"), true);
        return 0;
      },
      poll_oneoff: (in_ptr, out_ptr, nsubscriptions, nevents_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        let eventsWritten = 0;

        for (let i = 0; i < nsubscriptions; i++) {
          const sub_ptr = in_ptr + i * 48; // subscription struct size is 48
          const userdata = view.getBigUint64(sub_ptr, true);
          const type = view.getUint8(sub_ptr + 8);

          // Event struct size is 32
          const event_ptr = out_ptr + i * 32;

          view.setBigUint64(event_ptr, userdata, true); // userdata
          view.setUint16(event_ptr + 8, 0, true); // error: success
          view.setUint8(event_ptr + 10, type); // type

          // fd_read (1) or fd_write (2)
          if (type === 1 || type === 2) {
            view.setBigUint64(event_ptr + 16, BigInt(1), true); // nbytes (dummy > 0)
            view.setUint16(event_ptr + 24, 0, true); // flags
            eventsWritten++;
          } else if (type === 0) { // clock
            // Just say it expired immediately
            eventsWritten++;
          }
        }

        view.setUint32(nevents_ptr, eventsWritten, true);
        return 0;
      },
      environ_sizes_get: (environ_count, environ_buf_size) => {
        const view = new DataView(instance.exports.memory.buffer);
        view.setUint32(environ_count, 0, true);
        view.setUint32(environ_buf_size, 0, true);
        return 0;
      },
      environ_get: (environ, environ_buf) => {
        return 0;
      },
      args_sizes_get: (argc, argv_buf_size) => {
        const view = new DataView(instance.exports.memory.buffer);
        view.setUint32(argc, 0, true);
        view.setUint32(argv_buf_size, 0, true);
        return 0;
      },
      args_get: (argv, argv_buf) => {
        return 0;
      },
      proc_exit: (code) => {
        self.postMessage({ type: 'exit', code });
        throw new Error(`Process exited with code ${code}`);
      },
      // Minimal stubs for other common calls
      fd_fdstat_set_flags: () => 0,
      fd_prestat_get: (fd, prestat_ptr) => {
        return 8; // EBADF (Error Bad File Descriptor) - indica que no hay directorios pre-abiertos
      },
      fd_prestat_dir_name: (fd, path, path_len) => {
        return 8; // EBADF
      },
      path_open: (fd, dirflags, path_ptr, path_len, oflags, fs_rights_base, fs_rights_inheriting, fdflags, opened_fd_ptr) => {
        return 44; // ENOENT (No such file or directory)
      },
      path_filestat_get: (fd, flags, path_ptr, path_len, buf_ptr) => {
        return 44; // ENOENT
      },
      fd_filestat_get: (fd, buf_ptr) => {
        return 0; // Success (dummy)
      },
      fd_readdir: (fd, buf, buf_len, cookie, res_buf_len_ptr) => {
        return 0;
      },
      path_readlink: (fd, path_ptr, path_len, buf_ptr, buf_len, nread_ptr) => {
        return 44; // ENOENT
      },
      clock_time_get: (id, precision, time_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        // id 0 is real time, id 1 is monotonic
        const now = BigInt(Math.floor(Date.now() * 1e6));
        view.setBigUint64(time_ptr, now, true);
        return 0;
      },
      random_get: (buf, buf_len) => {
        const memory = new Uint8Array(instance.exports.memory.buffer);
        const chunk = memory.subarray(buf, buf + buf_len);
        crypto.getRandomValues(chunk);
        return 0;
      },
      sched_yield: () => 0,
    }
  };

  try {
    const response = await fetch(wasmUrl);
    const bytes = await response.arrayBuffer();
    const result = await WebAssembly.instantiate(bytes, imports);
    instance = result.instance;

    // Start the WASI module
    if (instance.exports._start) {
      instance.exports._start();
    } else {
      self.postMessage({ type: 'output', data: 'Error: No _start function found in WASM.' });
    }
  } catch (err) {
    console.error(err);
    self.postMessage({
      type: 'output', data: `
Error: ${err.message}
` });
  }
};
