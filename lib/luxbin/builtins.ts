import { LuxValue, Environment } from "./interpreter";

type BuiltinFn = (args: LuxValue[], env: Environment) => LuxValue;

function stringify(value: LuxValue): string {
  if (value === null) return "nil";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return "[" + value.map(stringify).join(", ") + "]";
  return String(value);
}

export function createBuiltins(output: string[]): Record<string, BuiltinFn> {
  return {
    // ── I/O ─────────────────────────────────────────────
    photon_print: (args) => {
      output.push(args.map(stringify).join(" "));
      return null;
    },

    // ── Math ────────────────────────────────────────────
    photon_abs: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_abs: expected number");
      return Math.abs(args[0]);
    },
    photon_sqrt: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_sqrt: expected number");
      return Math.sqrt(args[0]);
    },
    photon_pow: (args) => {
      if (typeof args[0] !== "number" || typeof args[1] !== "number")
        throw new Error("photon_pow: expected two numbers");
      return Math.pow(args[0], args[1]);
    },
    photon_sin: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_sin: expected number");
      return Math.sin(args[0]);
    },
    photon_cos: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_cos: expected number");
      return Math.cos(args[0]);
    },
    photon_tan: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_tan: expected number");
      return Math.tan(args[0]);
    },
    photon_floor: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_floor: expected number");
      return Math.floor(args[0]);
    },
    photon_ceil: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_ceil: expected number");
      return Math.ceil(args[0]);
    },
    photon_round: (args) => {
      if (typeof args[0] !== "number") throw new Error("photon_round: expected number");
      return Math.round(args[0]);
    },
    photon_min: (args) => {
      const nums = args.filter((a): a is number => typeof a === "number");
      if (nums.length === 0) throw new Error("photon_min: expected at least one number");
      return Math.min(...nums);
    },
    photon_max: (args) => {
      const nums = args.filter((a): a is number => typeof a === "number");
      if (nums.length === 0) throw new Error("photon_max: expected at least one number");
      return Math.max(...nums);
    },
    photon_random: () => {
      return Math.random();
    },

    // ── String ──────────────────────────────────────────
    photon_len: (args) => {
      const val = args[0];
      if (typeof val === "string") return val.length;
      if (Array.isArray(val)) return val.length;
      throw new Error("photon_len: expected string or array");
    },
    photon_concat: (args) => {
      return args.map(stringify).join("");
    },
    photon_slice: (args) => {
      const val = args[0];
      const start = typeof args[1] === "number" ? args[1] : 0;
      const end = typeof args[2] === "number" ? args[2] : undefined;
      if (typeof val === "string") return val.slice(start, end);
      if (Array.isArray(val)) return val.slice(start, end);
      throw new Error("photon_slice: expected string or array");
    },
    photon_upper: (args) => {
      if (typeof args[0] !== "string") throw new Error("photon_upper: expected string");
      return args[0].toUpperCase();
    },
    photon_lower: (args) => {
      if (typeof args[0] !== "string") throw new Error("photon_lower: expected string");
      return args[0].toLowerCase();
    },

    // ── Type Conversions ────────────────────────────────
    photon_to_int: (args) => {
      const val = args[0];
      if (typeof val === "number") return Math.floor(val);
      if (typeof val === "string") {
        const n = parseInt(val, 10);
        if (isNaN(n)) throw new Error(`photon_to_int: cannot convert '${val}'`);
        return n;
      }
      if (typeof val === "boolean") return val ? 1 : 0;
      throw new Error("photon_to_int: unsupported type");
    },
    photon_to_float: (args) => {
      const val = args[0];
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const n = parseFloat(val);
        if (isNaN(n)) throw new Error(`photon_to_float: cannot convert '${val}'`);
        return n;
      }
      if (typeof val === "boolean") return val ? 1.0 : 0.0;
      throw new Error("photon_to_float: unsupported type");
    },
    photon_to_string: (args) => {
      return stringify(args[0]);
    },
    photon_to_bool: (args) => {
      const val = args[0];
      if (val === null || val === false || val === 0 || val === "") return false;
      return true;
    },
    photon_type: (args) => {
      const val = args[0];
      if (val === null) return "nil";
      if (typeof val === "number") return Number.isInteger(val) ? "int" : "float";
      if (typeof val === "string") return "string";
      if (typeof val === "boolean") return "bool";
      if (Array.isArray(val)) return "array";
      return "unknown";
    },

    // ── Array ───────────────────────────────────────────
    photon_push: (args) => {
      if (!Array.isArray(args[0])) throw new Error("photon_push: first argument must be an array");
      args[0].push(args[1]);
      return args[0];
    },
    photon_pop: (args) => {
      if (!Array.isArray(args[0])) throw new Error("photon_pop: expected array");
      if (args[0].length === 0) throw new Error("photon_pop: array is empty");
      return args[0].pop() ?? null;
    },
    photon_sort: (args) => {
      if (!Array.isArray(args[0])) throw new Error("photon_sort: expected array");
      const arr = [...args[0]];
      arr.sort((a, b) => {
        if (typeof a === "number" && typeof b === "number") return a - b;
        return stringify(a).localeCompare(stringify(b));
      });
      return arr;
    },
    photon_reverse: (args) => {
      if (!Array.isArray(args[0])) throw new Error("photon_reverse: expected array");
      return [...args[0]].reverse();
    },
    photon_range: (args) => {
      const start = typeof args[0] === "number" ? args[0] : 0;
      const end = typeof args[1] === "number" ? args[1] : (typeof args[0] === "number" ? args[0] : 0);
      const step = typeof args[2] === "number" ? args[2] : 1;
      if (step === 0) throw new Error("photon_range: step cannot be zero");
      const result: number[] = [];
      if (args.length === 1) {
        for (let i = 0; i < start; i++) result.push(i);
      } else {
        if (step > 0) {
          for (let i = start; i < end; i += step) result.push(i);
        } else {
          for (let i = start; i > end; i += step) result.push(i);
        }
      }
      return result;
    },

    // ── Wavelength (Photonic Encoding) ──────────────────
    photon_wavelength: (args) => {
      if (typeof args[0] !== "string" || args[0].length === 0)
        throw new Error("photon_wavelength: expected a non-empty string");
      // Map character to wavelength in nm (380-780nm visible spectrum)
      const code = args[0].charCodeAt(0);
      const wavelength = 380 + (code % 128) * (400 / 128);
      return Math.round(wavelength * 100) / 100;
    },
    photon_char: (args) => {
      if (typeof args[0] !== "number")
        throw new Error("photon_char: expected a number (wavelength in nm)");
      // Reverse mapping: wavelength to character
      const code = Math.round(((args[0] - 380) * 128) / 400) % 128;
      return String.fromCharCode(Math.abs(code));
    },

    // ── Quantum (Simulated) ─────────────────────────────
    superpose: (args) => {
      // Superpose returns an array of states with equal probability
      if (!Array.isArray(args[0])) throw new Error("superpose: expected array of states");
      return args[0]; // Returns the superposition (array of possible states)
    },
    measure: (args) => {
      // Collapse superposition: pick one randomly
      if (Array.isArray(args[0]) && args[0].length > 0) {
        const idx = Math.floor(Math.random() * args[0].length);
        return args[0][idx];
      }
      return args[0];
    },
    entangle: (args) => {
      // Simulate entanglement: return correlated pair
      if (args.length < 2) throw new Error("entangle: expected two values");
      return [args[0], args[1]];
    },
    hadamard: (args) => {
      // Hadamard gate simulation: 50/50 collapse
      if (typeof args[0] === "number") {
        return Math.random() < 0.5 ? 0 : 1;
      }
      return Math.random() < 0.5 ? args[0] : (args.length > 1 ? args[1] : null);
    },
  };
}
