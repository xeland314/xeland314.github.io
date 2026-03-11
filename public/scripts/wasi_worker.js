
/**
 * WASI Worker with SharedArrayBuffer correlation for stdin.
 * Based on standard WASI snapshot_preview1 specifications.
 */

self.onmessage = async (e) => {
  const { wasmUrl, sab } = e.data;
  if (!sab) {
    console.error("wasi_worker.js: No SharedArrayBuffer provided");
    return;
  }

  const lock = new Int32Array(sab);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  let instance;

  // WASI Error Codes
  const WASI_ESUCCESS = 0;
  const WASI_EBADF = 8;
  const WASI_EINVAL = 28;
  const WASI_ENOSYS = 52;
  const WASI_ENOTTY = 59;
  const WASI_ENOTCAPABLE = 76;
  const WASI_ESPIPE = 70;

  const imports = {
    wasi_snapshot_preview1: {
      // Write to a file descriptor
      fd_write: (fd, iovs_ptr, iovs_len, nwritten_ptr) => {
        const memory = new Uint8Array(instance.exports.memory.buffer);
        const view = new DataView(instance.exports.memory.buffer);
        let written = 0;

        for (let i = 0; i < iovs_len; i++) {
          const ptr = view.getUint32(iovs_ptr + i * 8, true);
          const len = view.getUint32(iovs_ptr + i * 8 + 4, true);

          if (len === 0) continue;

          const chunk = memory.subarray(ptr, ptr + len);
          // Use {stream: true} for potential multi-byte splits
          const string = dec.decode(chunk, { stream: true });
          
          if (string.length > 0) {
            // console.log(`wasi_worker.js: fd_write(fd=${fd}, len=${len}): ${JSON.stringify(string)}`);
            self.postMessage({ type: 'output', data: string });
          }
          written += len;
        }

        view.setUint32(nwritten_ptr, written, true);
        return WASI_ESUCCESS;
      },

      // Read from a file descriptor
      fd_read: (fd, iovs_ptr, iovs_len, nread_ptr) => {
        if (fd !== 0) return WASI_EBADF;

        const view = new DataView(instance.exports.memory.buffer);
        const memory = new Uint8Array(instance.exports.memory.buffer);
        let totalRead = 0;

        for (let i = 0; i < iovs_len; i++) {
          const ptr = view.getUint32(iovs_ptr + i * 8, true);
          const len = view.getUint32(iovs_ptr + i * 8 + 4, true);

          for (let j = 0; j < len; j++) {
            if (Atomics.load(lock, 0) === 0) {
              Atomics.wait(lock, 0, 0);
            }

            const charCode = lock[1];
            // console.log(`wasi_worker.js: fd_read(fd=${fd}) received byte: ${charCode}`);
            
            memory[ptr + j] = charCode;
            totalRead++;

            Atomics.store(lock, 0, 0);
            Atomics.notify(lock, 0, 1);

            view.setUint32(nread_ptr, totalRead, true);
            return WASI_ESUCCESS;
          }
        }

        view.setUint32(nread_ptr, totalRead, true);
        return WASI_ESUCCESS;
      },

      // Basic metadata about a file descriptor
      fd_fdstat_get: (fd, stat_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        if (fd >= 0 && fd <= 2) {
            view.setUint8(stat_ptr, 2); 
            view.setUint16(stat_ptr + 2, 0, true); 
            const ttyRights = 2n | 64n | 8n | 67108864n | 1048576n;
            view.setBigUint64(stat_ptr + 8, ttyRights, true); 
            view.setBigUint64(stat_ptr + 16, 0n, true); 
            return WASI_ESUCCESS;
        }
        return WASI_EBADF;
      },

      poll_oneoff: (in_ptr, out_ptr, nsubscriptions, nevents_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        let eventsWritten = 0;

        for (let i = 0; i < nsubscriptions; i++) {
          const sub_ptr = in_ptr + i * 48;
          const userdata = view.getBigUint64(sub_ptr, true);
          const type = view.getUint8(sub_ptr + 8);
          const event_ptr = out_ptr + i * 32;

          view.setBigUint64(event_ptr, userdata, true);
          view.setUint16(event_ptr + 8, 0, true); 
          view.setUint8(event_ptr + 10, type);

          if (type === 1) { // fd_read
            const sub_fd = view.getUint32(sub_ptr + 16, true);
            if (sub_fd === 0) {
              const available = Atomics.load(lock, 0) === 1;
              view.setBigUint64(event_ptr + 16, available ? 1n : 0n, true);
              view.setUint16(event_ptr + 24, 0, true);
              eventsWritten++;
            } else {
              view.setBigUint64(event_ptr + 16, 0n, true);
              view.setUint16(event_ptr + 24, 0, true);
              eventsWritten++;
            }
          } else if (type === 2) { // fd_write
            view.setBigUint64(event_ptr + 16, 1n, true);
            view.setUint16(event_ptr + 24, 0, true);
            eventsWritten++;
          } else if (type === 0) { // clock
            view.setBigUint64(event_ptr + 16, 0n, true);
            eventsWritten++;
          }
        }

        view.setUint32(nevents_ptr, eventsWritten, true);
        return WASI_ESUCCESS;
      },

      fd_filestat_get: (fd, buf_ptr) => {
        if (fd < 0 || fd > 2) return WASI_EBADF;
        const view = new DataView(instance.exports.memory.buffer);
        view.setBigUint64(buf_ptr, 0n, true);
        view.setBigUint64(buf_ptr + 8, 0n, true);
        view.setUint8(buf_ptr + 16, 2); 
        view.setBigUint64(buf_ptr + 24, 1n, true); 
        view.setBigUint64(buf_ptr + 32, 0n, true); 
        return WASI_ESUCCESS;
      },

      environ_sizes_get: (count_ptr, size_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        view.setUint32(count_ptr, 0, true);
        view.setUint32(size_ptr, 0, true);
        return WASI_ESUCCESS;
      },
      environ_get: (environ_ptr, environ_buf_ptr) => WASI_ESUCCESS,
      args_sizes_get: (argc_ptr, argv_buf_size_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        view.setUint32(argc_ptr, 0, true);
        view.setUint32(argv_buf_size_ptr, 0, true);
        return WASI_ESUCCESS;
      },
      args_get: (argv_ptr, argv_buf_ptr) => WASI_ESUCCESS,

      proc_exit: (code) => {
        console.log(`wasi_worker.js: proc_exit called with code ${code}`);
        self.postMessage({ type: 'exit', code });
        // Instead of throwing, we let it trap naturally if unreachable is hit, 
        // or we throw a special string that we ignore in our catch.
        throw "WASI_EXIT"; 
      },

      clock_time_get: (id, precision, time_ptr) => {
        const view = new DataView(instance.exports.memory.buffer);
        const now = BigInt(Math.floor(Date.now() * 1e6));
        view.setBigUint64(time_ptr, now, true);
        return WASI_ESUCCESS;
      },

      random_get: (buf_ptr, buf_len) => {
        const memory = new Uint8Array(instance.exports.memory.buffer);
        crypto.getRandomValues(memory.subarray(buf_ptr, buf_ptr + buf_len));
        return WASI_ESUCCESS;
      },

      fd_seek: (fd, offset, whence, newoffset_ptr) => WASI_ESPIPE,
      fd_close: (fd) => WASI_ESUCCESS,
      fd_advise: (fd, offset, len, advice) => WASI_ESUCCESS,
      fd_allocate: (fd, offset, len) => WASI_ENOSYS,
      fd_datasync: (fd) => WASI_ESUCCESS,
      fd_sync: (fd) => WASI_ESUCCESS,
      fd_fdstat_set_flags: (fd, flags) => WASI_ESUCCESS,
      fd_prestat_get: (fd, buf_ptr) => WASI_EBADF,
      fd_prestat_dir_name: (fd, path_ptr, path_len) => WASI_EBADF,
      path_open: (fd, dirflags, path_ptr, path_len, oflags, fs_rights_base, fs_rights_inheriting, fdflags, opened_fd_ptr) => WASI_ENOTCAPABLE,
      path_filestat_get: (fd, flags, path_ptr, path_len, buf_ptr) => WASI_ENOTCAPABLE,
      fd_readdir: (fd, buf_ptr, buf_len, cookie, nwritten_ptr) => WASI_ENOTCAPABLE,
      path_readlink: (fd, path_ptr, path_len, buf_ptr, buf_len, nwritten_ptr) => WASI_ENOTCAPABLE,
      sched_yield: () => WASI_ESUCCESS,
      fd_pread: (fd, iovs_ptr, iovs_len, offset, nread_ptr) => WASI_ENOSYS,
      fd_pwrite: (fd, iovs_ptr, iovs_len, offset, nwritten_ptr) => WASI_ENOSYS,
      fd_renumber: (fd, to) => WASI_EBADF,
      fd_tell: (fd, offset_ptr) => WASI_ENOSYS,
      path_create_directory: (fd, path_ptr, path_len) => WASI_ENOTCAPABLE,
      path_link: (old_fd, old_flags, old_path_ptr, old_path_len, new_fd, new_path_ptr, new_path_len) => WASI_ENOTCAPABLE,
      path_remove_directory: (fd, path_ptr, path_len) => WASI_ENOTCAPABLE,
      path_rename: (fd, old_path_ptr, old_path_len, new_fd, new_path_ptr, new_path_len) => WASI_ENOTCAPABLE,
      path_symlink: (old_path_ptr, old_path_len, fd, new_path_ptr, new_path_len) => WASI_ENOTCAPABLE,
      path_unlink_file: (fd, path_ptr, path_len) => WASI_ENOTCAPABLE,
      path_filestat_set_size: (fd, flags, path_ptr, path_len, size) => WASI_ENOTCAPABLE,
      path_filestat_set_times: (fd, flags, path_ptr, path_len, atim, mtim, fst_flags) => WASI_ENOTCAPABLE,
      fd_filestat_set_size: (fd, size) => WASI_ENOTCAPABLE,
      fd_filestat_set_times: (fd, atim, mtim, fst_flags) => WASI_ENOTCAPABLE,
      sock_recv: (fd, ri_data_ptr, ri_data_len, ri_flags, ro_datalen_ptr, ro_flags_ptr) => WASI_ENOSYS,
      sock_send: (fd, si_data_ptr, si_data_len, si_flags, so_datalen_ptr) => WASI_ENOSYS,
      sock_shutdown: (fd, how) => WASI_ENOSYS,
    }
  };

  try {
    console.log(`wasi_worker.js: Fetching WASM from ${wasmUrl}...`);
    const response = await fetch(wasmUrl);
    const bytes = await response.arrayBuffer();
    
    console.log(`wasi_worker.js: Instantiating WASM...`);
    const { instance: wasmInstance } = await WebAssembly.instantiate(bytes, imports);
    instance = wasmInstance;

    console.log(`wasi_worker.js: Invoking _start...`);
    if (instance.exports._start) {
        instance.exports._start();
    } else if (instance.exports.main) {
        instance.exports.main();
    } else {
        throw new Error("No _start or main function found in WASM module.");
    }
  } catch (err) {
    if (err === "WASI_EXIT") return;
    console.error(`wasi_worker.js error:`, err);
    self.postMessage({ type: 'output', data: `\nError: ${err.message || err}\n` });
  }
};
