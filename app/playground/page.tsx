"use client";

import { useState, useCallback } from "react";
import { Lexer } from "@/lib/luxbin/lexer";
import { Parser } from "@/lib/luxbin/parser";
import { interpret, InterpreterResult } from "@/lib/luxbin/interpreter";

const EXAMPLES: Record<string, string> = {
  "Hello World": `# Hello World in LUXBIN Light Language
photon_print("Hello, Photonic World!")
photon_print("Welcome to the LUXBIN VM Playground")`,

  "Fibonacci": `# Fibonacci sequence (recursive)
func fib(n)
  if n <= 1 then
    return n
  end
  return fib(n - 1) + fib(n - 2)
end

let i = 0
while i < 10 do
  photon_print("fib(" + photon_to_string(i) + ") = " + photon_to_string(fib(i)))
  i = i + 1
end`,

  "Factorial": `# Factorial with recursion
func factorial(n)
  if n <= 1 then
    return 1
  end
  return n * factorial(n - 1)
end

for i in photon_range(1, 11) do
  photon_print(photon_to_string(i) + "! = " + photon_to_string(factorial(i)))
end`,

  "Bubble Sort": `# Bubble sort implementation
func bubble_sort(arr)
  let n = photon_len(arr)
  let i = 0
  while i < n - 1 do
    let j = 0
    while j < n - i - 1 do
      if arr[j] > arr[j + 1] then
        let temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      end
      j = j + 1
    end
    i = i + 1
  end
  return arr
end

let data = [64, 34, 25, 12, 22, 11, 90]
photon_print("Before: " + photon_to_string(data))
let sorted = bubble_sort(data)
photon_print("After:  " + photon_to_string(sorted))`,

  "Quantum RNG": `# Quantum Random Number Generator (simulated)
photon_print("=== Quantum Random Number Generator ===")
photon_print("")

# Create superposition of states
let states = superpose([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
photon_print("Superposition created with 10 states")

# Measure 10 random numbers
photon_print("")
photon_print("Measuring 10 quantum random numbers:")
let i = 0
while i < 10 do
  let result = measure(states)
  photon_print("  Measurement " + photon_to_string(i + 1) + ": " + photon_to_string(result))
  i = i + 1
end

# Hadamard gate coin flips
photon_print("")
photon_print("Hadamard gate coin flips:")
let heads = 0
let tails = 0
let j = 0
while j < 20 do
  let flip = hadamard(0)
  if flip == 0 then
    heads = heads + 1
  else
    tails = tails + 1
  end
  j = j + 1
end
photon_print("  Heads: " + photon_to_string(heads))
photon_print("  Tails: " + photon_to_string(tails))`,

  "Wavelength Demo": `# Photonic Wavelength Encoding
photon_print("=== Photonic Wavelength Encoding ===")
photon_print("")

# Encode a message as wavelengths
let message = "LUXBIN"
photon_print("Encoding: " + message)
photon_print("")

let i = 0
while i < photon_len(message) do
  let ch = message[i]
  let wl = photon_wavelength(ch)
  photon_print("  '" + ch + "' -> " + photon_to_string(wl) + " nm")
  i = i + 1
end

# Decode back
photon_print("")
photon_print("Decoding wavelengths back:")
let wavelengths = [417.19, 430.63, 437.5, 406.25, 411.88, 421.88]
for wl in wavelengths do
  let ch = photon_char(wl)
  photon_print("  " + photon_to_string(wl) + " nm -> '" + ch + "'")
end`,

  "FizzBuzz": `# FizzBuzz
for i in photon_range(1, 31) do
  if i % 15 == 0 then
    photon_print("FizzBuzz")
  else if i % 3 == 0 then
    photon_print("Fizz")
  else if i % 5 == 0 then
    photon_print("Buzz")
  else
    photon_print(photon_to_string(i))
  end
end`,
};

export default function PlaygroundPage() {
  const [code, setCode] = useState(EXAMPLES["Hello World"]);
  const [result, setResult] = useState<InterpreterResult | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const runCode = useCallback(() => {
    setRunning(true);
    const start = performance.now();

    // Use setTimeout to allow the UI to update before running
    setTimeout(() => {
      try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parse();
        const res = interpret(ast);
        setResult(res);
      } catch (e) {
        setResult({
          output: [],
          steps: 0,
          error: e instanceof Error ? e.message : String(e),
        });
      }
      setElapsed(Math.round((performance.now() - start) * 100) / 100);
      setRunning(false);
    }, 10);
  }, [code]);

  const loadExample = (name: string) => {
    setCode(EXAMPLES[name]);
    setResult(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          LUXBIN VM Playground
        </h1>
        <p className="text-slate-400">
          Write and execute LUXBIN Light Language code in your browser
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          onClick={runCode}
          disabled={running}
          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          {running ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <span className="text-base">&#9654;</span>
              Run
            </>
          )}
        </button>
        <select
          onChange={(e) => {
            if (e.target.value) loadExample(e.target.value);
          }}
          defaultValue=""
          className="px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
        >
          <option value="" disabled>
            Load Example...
          </option>
          {Object.keys(EXAMPLES).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Editor + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border border-slate-700 border-b-0 rounded-t-lg">
            <span className="text-xs font-mono text-slate-400">
              editor.lux
            </span>
            <span className="text-xs text-slate-500">Light Language</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-[500px] bg-slate-900 border border-slate-700 rounded-b-lg p-4 font-mono text-sm text-slate-200 resize-none focus:outline-none focus:border-violet-500 leading-relaxed"
            placeholder="# Write your LUXBIN code here..."
          />
        </div>

        {/* Output Console */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border border-slate-700 border-b-0 rounded-t-lg">
            <span className="text-xs font-mono text-slate-400">output</span>
            {result && !result.error && (
              <span className="text-xs text-green-400">
                {result.steps.toLocaleString()} steps &middot; {elapsed}ms
              </span>
            )}
            {result?.error && (
              <span className="text-xs text-red-400">Error</span>
            )}
          </div>
          <div className="w-full h-[500px] bg-slate-950 border border-slate-700 rounded-b-lg p-4 font-mono text-sm overflow-auto">
            {!result && (
              <span className="text-slate-600">
                Click &quot;Run&quot; to execute your code...
              </span>
            )}
            {result?.error && (
              <div className="text-red-400">
                <span className="text-red-500 font-semibold">Error: </span>
                {result.error}
              </div>
            )}
            {result && (
              <div>
                {result.output.map((line, i) => (
                  <div key={i} className="text-slate-200 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                {result.output.length === 0 && !result.error && (
                  <span className="text-slate-600">
                    (no output — use photon_print() to display values)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-semibold text-white mb-3">
            Language Basics
          </h3>
          <div className="space-y-1 text-xs font-mono text-slate-400">
            <p>
              <span className="text-violet-400">let</span> x = 42
            </p>
            <p>
              <span className="text-violet-400">const</span> PI = 3.14
            </p>
            <p>
              <span className="text-violet-400">func</span> add(a, b)
            </p>
            <p>
              &nbsp;&nbsp;<span className="text-violet-400">return</span> a + b
            </p>
            <p>
              <span className="text-violet-400">end</span>
            </p>
            <p>
              <span className="text-violet-400">if</span> x &gt; 0{" "}
              <span className="text-violet-400">then</span> ...{" "}
              <span className="text-violet-400">end</span>
            </p>
            <p>
              <span className="text-violet-400">while</span> x &gt; 0{" "}
              <span className="text-violet-400">do</span> ...{" "}
              <span className="text-violet-400">end</span>
            </p>
            <p>
              <span className="text-violet-400">for</span> i{" "}
              <span className="text-violet-400">in</span> arr{" "}
              <span className="text-violet-400">do</span> ...{" "}
              <span className="text-violet-400">end</span>
            </p>
            <p>
              <span className="text-slate-600"># comment</span>
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-semibold text-white mb-3">
            Standard Library
          </h3>
          <div className="space-y-1 text-xs font-mono text-slate-400">
            <p>
              <span className="text-cyan-400">photon_print</span>(value)
            </p>
            <p>
              <span className="text-cyan-400">photon_len</span>(str_or_arr)
            </p>
            <p>
              <span className="text-cyan-400">photon_range</span>(start, end)
            </p>
            <p>
              <span className="text-cyan-400">photon_push</span>(arr, val)
            </p>
            <p>
              <span className="text-cyan-400">photon_sort</span>(arr)
            </p>
            <p>
              <span className="text-cyan-400">photon_to_string</span>(val)
            </p>
            <p>
              <span className="text-cyan-400">photon_to_int</span>(val)
            </p>
            <p>
              <span className="text-cyan-400">photon_abs</span>,{" "}
              <span className="text-cyan-400">photon_sqrt</span>,{" "}
              <span className="text-cyan-400">photon_pow</span>
            </p>
            <p>
              <span className="text-cyan-400">photon_upper</span>,{" "}
              <span className="text-cyan-400">photon_lower</span>
            </p>
            <p>
              <span className="text-cyan-400">photon_wavelength</span>,{" "}
              <span className="text-cyan-400">photon_char</span>
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
          <h3 className="text-sm font-semibold text-white mb-3">
            Quantum Functions
          </h3>
          <div className="space-y-1 text-xs font-mono text-slate-400">
            <p>
              <span className="text-amber-400">superpose</span>([0, 1]) —
              create superposition
            </p>
            <p>
              <span className="text-amber-400">measure</span>(state) — collapse
              to value
            </p>
            <p>
              <span className="text-amber-400">entangle</span>(a, b) — create
              pair
            </p>
            <p>
              <span className="text-amber-400">hadamard</span>(bit) — 50/50
              gate
            </p>
            <p className="text-slate-600 mt-2">
              Quantum ops use Math.random() for probabilistic simulation in the
              browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
