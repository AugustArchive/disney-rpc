import { Socket, createConnection } from 'chrome-net';

interface DecodeResult {
  op: number;
  data: any;
}

export const encode = (op: number, data: any) => {
  const d = JSON.stringify(data);
  const length = Buffer.byteLength(d);
  const packet = Buffer.alloc(8 + length);

  packet.writeInt32LE(op, 0);
  packet.writeInt32LE(length, 4);
  packet.write(d, 8, length);
  return packet;
};

export const decode = (socket: Socket, callback: (result: DecodeResult) => void) => {
  let working: { full: string; op: number | null; } = {
    full: '',
    op: null
  };

  const packet = socket.read();
  if (!packet) return;

  let op = working.op;
  let raw: any;
  if (working.full === '') {
    op = working.op = packet.readInt32LE(0);
    raw = packet.slice(8, packet.readInt32LE(4) + 8);
  } else {
    raw = packet.toString();
  }

  try {
    let data = JSON.parse(working.full + raw);
    callback({ op: op!, data });
    working.full = '';
    working.op = null;
  } catch {
    working.full += raw;
  }

  decode(socket, callback);
};

/**
 * Gets the IPC path
 * @param id The ID of the ipc path
 */
export const getIPCPath = (id: number) => {
  //* If the OS is Windows
  if (process.platform === 'win32') return `\\\\?\\pipe\\discord-ipc-${id}`;

  const prefix = (
    process.env.XDG_RUNTIME_DIR || 
    process.env.TMPDIR ||
    process.env.TEMP ||
    process.env.TMP ||
    '/tmp'
  );

  return `${prefix.replace(/\/$/, '')}/discord-ipc-${id}`;
};

/**
 * Gets the IPC path
 * @param id The ID
 */
export const getIPC = (id: number = 0) => new Promise<Socket>((resolve, reject) => {
  const path = getIPCPath(id);
  const onError = () => {
    if (id < 10) {
      resolve(getIPC(id + 1));
    } else {
      reject(new Error('Could not connect to IPC server'));
    }
  };

  const socket = createConnection(path, () => {
    socket.removeListener('error', onError);
    resolve(socket);
  });

  socket.once('error', onError);
});

/**
 * The OPCodes for the Socket from Discord
 */
export enum OPCodes {
  HANDSHAKE,
  FRAME,
  CLOSE,
  PING,
  PONG
}

/**
 * The commands to send to Discord
 */
export enum RequestCommand {
  /**
   * Sets the activity for Discord
   */
  SetActivity = 'SET_ACTIVITY'
}

/**
 * Makes a random UUID for Discord
 * @credit [discordjs/RPC](https://github.com/discordjs/RPC/blob/master/src/util.js) (**MIT License**)
 * @returns The uuid for Discord as `nonce`
 */
export const uuid = () => {
  let uuid = '';
  for (let i = 0; i < 32; i += 1) {
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
    let n: number;
    if (i === 12) {
      n = 4;
    } else {
      const random = (Math.random() * 16) | 0;
      if (i === 16) {
        n = (random & 3) | 0;
      } else {
        n = random;
      }
    }

    uuid += n.toString();
  }

  return uuid;
};