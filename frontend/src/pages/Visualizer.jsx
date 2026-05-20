import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Pause, BookOpen, Settings } from 'lucide-react';

// ─── Algorithms / Data Structures config ─────────────────────────────────────
const DS_LIST = [
  { id: 'array', label: 'Array', emoji: '📦', color: '#58A6FF' },
  { id: 'stack', label: 'Stack', emoji: '📚', color: '#F0883E' },
  { id: 'queue', label: 'Queue', emoji: '🚶', color: '#3FB950' },
  { id: 'linkedlist', label: 'Linked List', emoji: '🔗', color: '#A78BFA' },
  { id: 'bsearch', label: 'Binary Search', emoji: '🔍', color: '#FF7B72' },
  { id: 'bubblesort', label: 'Bubble Sort', emoji: '🫧', color: '#D2B48C' },
  { id: 'bst', label: 'BST', emoji: '🌳', color: '#56D364' },
];

// ─── GeeksForGeeks Concept & Complexities Guide ──────────────────────────────
const GFG_GUIDE = {
  'array': {
    time: 'Access: O(1) | Search: O(n) | Insertion: O(n) | Deletion: O(n)',
    space: 'O(1) auxiliary space',
    pseudocode: `// Access Element at Index\nfunction accessElement(arr, index) {\n    return arr[index]; // O(1) complexity\n}\n\n// Deletion at Index\nfunction deleteAtIndex(arr, index) {\n    for i from index to arr.length - 2:\n        arr[i] = arr[i+1];\n    arr.pop(); // Shift left, O(n)\n}`,
    theory: 'An Array is a linear data structure that stores elements of the same type in contiguous memory locations. It provides direct constant-time access by index.'
  },
  'stack': {
    time: 'Push: O(1) | Pop: O(1) | Top: O(1) | Search: O(n)',
    space: 'O(n) space complexity',
    pseudocode: `// Push Operation\nfunction push(stack, value) {\n    stack.top = stack.top + 1;\n    stack[stack.top] = value; // O(1)\n}\n\n// Pop Operation\nfunction pop(stack) {\n    if (isEmpty(stack)) return "Underflow";\n    val = stack[stack.top];\n    stack.top = stack.top - 1;\n    return val; // O(1)\n}`,
    theory: 'A Stack is a LIFO (Last In First Out) linear data structure. All insertions and deletions take place at a single end, called the Top.'
  },
  'queue': {
    time: 'Enqueue: O(1) | Dequeue: O(1) | Front: O(1) | Rear: O(1)',
    space: 'O(n) space complexity',
    pseudocode: `// Enqueue Operation\nfunction enqueue(queue, value) {\n    queue.rear = queue.rear + 1;\n    queue[queue.rear] = value; // O(1)\n}\n\n// Dequeue Operation\nfunction dequeue(queue) {\n    if (isEmpty(queue)) return "Underflow";\n    val = queue[queue.front];\n    queue.front = queue.front + 1;\n    return val; // O(1)\n}`,
    theory: 'A Queue is a FIFO (First In First Out) linear data structure. Elements are inserted at the Rear and removed from the Front.'
  },
  'linkedlist': {
    time: 'Access: O(n) | Search: O(n) | Insertion: O(1) | Deletion: O(1)',
    space: 'O(1) auxiliary space',
    pseudocode: `// Insert Node at Head\nfunction insertAtHead(head, value) {\n    newNode = new Node(value);\n    newNode.next = head;\n    head = newNode; // O(1) pointer redirection\n}\n\n// Traverse Node List\nfunction traverse(head) {\n    current = head;\n    while (current != null):\n        print(current.data);\n        current = current.next;\n}`,
    theory: 'A Linked List is a dynamic linear data structure where elements (nodes) are stored at non-contiguous locations, linked using pointers.'
  },
  'bsearch': {
    time: 'Best: O(1) | Average/Worst: O(log n)',
    space: 'O(1) iterative | O(log n) recursive',
    pseudocode: `// Binary Search Loop\nfunction binarySearch(arr, target) {\n    lo = 0, hi = arr.length - 1;\n    while (lo <= hi) {\n        mid = floor((lo + hi) / 2);\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1; // Not found\n}`,
    theory: 'Binary Search is a divide-and-conquer algorithm that finds a target in a SORTED array by repeatedly halving the search interval.'
  },
  'bubblesort': {
    time: 'Best: O(n) sorted | Avg/Worst: O(n²)',
    space: 'O(1) auxiliary space',
    pseudocode: `// Bubble Sort Double Loop\nfunction bubbleSort(arr) {\n    n = arr.length;\n    for i from 0 to n-1:\n        for j from 0 to n-i-2:\n            if arr[j] > arr[j+1]:\n                swap(arr[j], arr[j+1]);\n}`,
    theory: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
  },
  'bst': {
    time: 'Insert: O(log n) average, O(n) skewed | Search: O(log n)',
    space: 'O(n) to store nodes',
    pseudocode: `// Insert in BST\nfunction insert(root, val) {\n    if (root == null) return new Node(val);\n    if (val < root.val) \n        root.left = insert(root.left, val);\n    else \n        root.right = insert(root.right, val);\n    return root;\n}`,
    theory: 'A Binary Search Tree is a node-based binary tree data structure where the left subtree contains keys less than the parent, and the right contains keys greater.'
  }
};

// ─── Generate steps dynamically ──────────────────────────────────────────────
function genSteps(id, customArr = [5, 3, 8, 1, 9, 2, 7, 4], targetVal = 9) {
  switch (id) {
    case 'array': return [
      { arr: customArr, highlight: [], info: 'Initial array with your custom elements. Index starts at 0.' },
      { arr: customArr, highlight: [0], info: `Access arr[0] = ${customArr[0] !== undefined ? customArr[0] : 'N/A'}. Direct O(1) access by index.` },
      { arr: customArr, highlight: [3].filter(idx => idx < customArr.length), info: `Access arr[3] = ${customArr[3] !== undefined ? customArr[3] : 'N/A'}. Still O(1) regardless of position.` },
      { arr: [...customArr, 99], highlight: [customArr.length], info: 'Push 99 → append to the end. O(1) amortized insertion.' },
      { arr: [...customArr, 99].filter((_, i) => i !== 0), highlight: [], info: 'Delete index 0 → shift all elements left. O(n) operation.' },
    ];
    case 'stack': {
      const steps = [{ stack: [], info: 'Empty stack. LIFO — Last In First Out principle.', op: '' }];
      const stack = [];
      customArr.slice(0, 5).forEach(v => {
        stack.push(v);
        steps.push({ stack: [...stack], info: `PUSH ${v} → stack top = ${v}`, op: 'push' });
      });
      if (stack.length > 0) {
        const removed = stack.pop();
        steps.push({ stack: [...stack], info: `POP → removed ${removed} (top element). O(1)`, op: 'pop' });
      }
      if (stack.length > 0) {
        const removed = stack.pop();
        steps.push({ stack: [...stack], info: `POP → removed ${removed}. Stack top is now ${stack[stack.length - 1] || 'none'}.`, op: 'pop' });
      }
      return steps;
    }
    case 'queue': {
      const steps = [{ queue: [], info: 'Empty queue. FIFO — First In First Out.', op: '' }];
      const queue = [];
      customArr.slice(0, 5).forEach(v => {
        queue.push(v);
        steps.push({ queue: [...queue], info: `ENQUEUE ${v} → rear = ${v}`, op: 'enqueue' });
      });
      if (queue.length > 0) {
        const removed = queue.shift();
        steps.push({ queue: [...queue], info: `DEQUEUE → removed ${removed} from front. O(1)`, op: 'dequeue' });
      }
      if (queue.length > 0) {
        const removed = queue.shift();
        steps.push({ queue: [...queue], info: `DEQUEUE → removed ${removed} from front. Front is now ${queue[0] || 'none'}.`, op: 'dequeue' });
      }
      return steps;
    }
    case 'linkedlist': {
      const steps = [{ nodes: [], info: 'Empty linked list. Each node holds data + pointer to next.' }];
      const nodes = [];
      customArr.slice(0, 5).forEach(v => {
        nodes.push(v);
        steps.push({ nodes: [...nodes], info: `Insert ${v} → Head is updated. Node has next pointer.` });
      });
      if (nodes.length > 1) {
        steps.push({ nodes: [...nodes], highlight: 1, info: `Traverse to node at index 1 (value = ${nodes[1]}). O(n) lookup.` });
      }
      if (nodes.length > 1) {
        const deleted = nodes.splice(1, 1)[0];
        steps.push({ nodes: [...nodes], info: `Delete node ${deleted} at index 1 → update pointers.` });
      }
      return steps;
    }
    case 'bsearch': {
      const sorted = [...customArr].sort((a, b) => a - b);
      const target = targetVal;
      const steps = [{ arr: sorted, lo: 0, hi: sorted.length - 1, mid: null, found: null, info: `Search target = ${target} in sorted array: [${sorted.join(', ')}]` }];
      
      let lo = 0;
      let hi = sorted.length - 1;
      let found = null;
      let attempts = 0;
      
      while (lo <= hi && attempts < 10) {
        attempts++;
        const mid = Math.floor((lo + hi) / 2);
        const val = sorted[mid];
        
        if (val === target) {
          found = mid;
          steps.push({ arr: sorted, lo, hi, mid, found, info: `mid=${mid}, arr[mid]=${val} = ${target} ✅ Target found at index ${mid}! O(log n)` });
          break;
        } else if (val < target) {
          steps.push({ arr: sorted, lo, hi, mid, found: null, info: `mid=${mid}, arr[mid]=${val} < ${target} → search right half [${mid + 1} to ${hi}].` });
          lo = mid + 1;
        } else {
          steps.push({ arr: sorted, lo, hi, mid, found: null, info: `mid=${mid}, arr[mid]=${val} > ${target} → search left half [${lo} to ${mid - 1}].` });
          hi = mid - 1;
        }
      }
      
      if (found === null) {
        steps.push({ arr: sorted, lo, hi, mid: null, found: null, info: `Target ${target} was not found in the array! Search space is fully exhausted.` });
      }
      
      return steps;
    }
    case 'bubblesort': {
      const steps = [];
      const b = [...customArr];
      steps.push({ arr: [...b], swapping: [], sorted: [], info: `Start Bubble Sort on custom elements: [${b.join(', ')}]` });
      for (let i = 0; i < b.length - 1; i++) {
        for (let j = 0; j < b.length - 1 - i; j++) {
          steps.push({ 
            arr: [...b], 
            swapping: [j, j + 1], 
            sorted: Array.from({ length: i }, (_, k) => b.length - 1 - k), 
            info: `Compare arr[${j}]=${b[j]} and arr[${j+1}]=${b[j+1]}` 
          });
          if (b[j] > b[j + 1]) {
            [b[j], b[j + 1]] = [b[j + 1], b[j]];
            steps.push({ 
              arr: [...b], 
              swapping: [j, j + 1], 
              sorted: Array.from({ length: i }, (_, k) => b.length - 1 - k), 
              info: `Swapped! → [${b.join(', ')}]` 
            });
          }
        }
      }
      steps.push({ arr: [...b], swapping: [], sorted: b.map((_, i) => i), info: 'Sorting completed successfully! O(n²) time complexity.' });
      return steps;
    }
    case 'bst': {
      const steps = [{ nodes: [], root: null, info: 'Empty BST. Left child < parent < right child.' }];
      customArr.slice(0, 7).forEach((v, idx) => {
        steps.push({ insert: v, info: idx === 0 ? `Insert ${v} → root node.` : `Insert ${v} → compare and traverse downwards to insert.` });
      });
      return steps;
    }
    default: return [];
  }
}

// ─── Visualizer components ────────────────────────────────────────────────────
const CELL = { width: 52, height: 48, borderRadius: 8 };

function ArrayViz({ step }) {
  const arr = step.arr || [];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '2rem 0' }}>
      {arr.map((v, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ ...CELL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'white', backgroundColor: step.highlight?.includes(i) ? '#58A6FF' : 'rgba(88,166,255,0.15)', border: `2px solid ${step.highlight?.includes(i) ? '#58A6FF' : 'rgba(88,166,255,0.3)'}`, transition: 'all 0.3s' }}>{v}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--color-dark-muted)', marginTop: 4 }}>[{i}]</div>
        </div>
      ))}
    </div>
  );
}

function StackViz({ step }) {
  const stack = step.stack || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 6, padding: '1rem 0', minHeight: 180 }}>
      {stack.length === 0 && <div style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>Empty Stack</div>}
      {stack.map((v, i) => (
        <div key={i} style={{ width: 120, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', color: 'white', backgroundColor: i === stack.length - 1 ? '#F0883E' : 'rgba(240,136,62,0.2)', border: `2px solid ${i === stack.length - 1 ? '#F0883E' : 'rgba(240,136,62,0.3)'}`, transition: 'all 0.3s', position: 'relative' }}>
          {v}
          {i === stack.length - 1 && <span style={{ position: 'absolute', right: -44, fontSize: '0.65rem', color: '#F0883E', fontWeight: 700 }}>← TOP</span>}
        </div>
      ))}
      <div style={{ width: 136, height: 4, backgroundColor: '#F0883E', borderRadius: 2, marginTop: 4 }} />
    </div>
  );
}

function QueueViz({ step }) {
  const queue = step.queue || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '2rem 0' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {queue.length === 0 && <div style={{ color: 'var(--color-dark-muted)', fontSize: '0.85rem' }}>Empty Queue</div>}
        {queue.map((v, i) => (
          <div key={i} style={{ width: 52, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 700, fontSize: '1.1rem', color: 'white', backgroundColor: i === 0 ? '#3FB950' : 'rgba(63,185,80,0.2)', border: `2px solid ${i === 0 ? '#3FB950' : 'rgba(63,185,80,0.3)'}`, transition: 'all 0.3s' }}>{v}</div>
        ))}
      </div>
      {queue.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: queue.length * 60, fontSize: '0.65rem', color: 'var(--color-dark-muted)', fontWeight: 700 }}>
          <span>← FRONT (dequeue)</span><span>REAR (enqueue) →</span>
        </div>
      )}
    </div>
  );
}

function LinkedListViz({ step }) {
  const nodes = step.nodes || [];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', padding: '2rem 0', justifyContent: 'center' }}>
      {nodes.length === 0 && <span style={{ color: 'var(--color-dark-muted)' }}>Empty List</span>}
      {nodes.map((v, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', border: `2px solid ${step.highlight === i ? '#A78BFA' : 'rgba(167,139,250,0.4)'}`, borderRadius: 8, overflow: 'hidden', transition: 'all 0.3s' }}>
              <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: step.highlight === i ? '#A78BFA' : 'rgba(167,139,250,0.15)', fontWeight: 700, color: 'white' }}>{v}</div>
              <div style={{ width: 30, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167,139,250,0.08)', color: 'var(--color-dark-muted)', fontSize: '0.6rem' }}>next</div>
            </div>
            {i === 0 && <span style={{ fontSize: '0.6rem', color: '#A78BFA', fontWeight: 700 }}>HEAD</span>}
          </div>
          {i < nodes.length - 1 ? <div style={{ color: '#A78BFA', fontWeight: 700, fontSize: '1.2rem' }}>→</div> : <div style={{ color: 'var(--color-dark-muted)', fontWeight: 700 }}>→ null</div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function BSearchViz({ step }) {
  const arr = step.arr || [];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '2rem 0' }}>
      {arr.map((v, i) => {
        const isLo = i === step.lo, isHi = i === step.hi, isMid = i === step.mid, isFound = i === step.found;
        const bg = isFound ? '#56D364' : isMid ? '#FF7B72' : (isLo || isHi) ? 'rgba(255,123,114,0.2)' : 'rgba(88,166,255,0.1)';
        const border = isFound ? '#56D364' : isMid ? '#FF7B72' : (isLo || isHi) ? 'rgba(255,123,114,0.4)' : 'rgba(88,166,255,0.2)';
        return (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 700, color: 'white', backgroundColor: bg, border: `2px solid ${border}`, transition: 'all 0.3s' }}>{v}</div>
            <div style={{ fontSize: '0.55rem', marginTop: 3, color: isFound ? '#56D364' : isMid ? '#FF7B72' : 'var(--color-dark-muted)' }}>
              {isFound ? '✅' : isMid ? 'mid' : isLo ? 'lo' : isHi ? 'hi' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BubbleSortViz({ step }) {
  const arr = step.arr || [];
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '2rem 0' }}>
      {arr.map((v, i) => {
        const isSwap = step.swapping?.includes(i), isSorted = step.sorted?.includes(i);
        return (
          <div key={i} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontWeight: 700, color: 'white', backgroundColor: isSorted ? 'rgba(86,211,100,0.3)' : isSwap ? '#FF7B72' : 'rgba(210,180,140,0.2)', border: `2px solid ${isSorted ? '#56D364' : isSwap ? '#FF7B72' : 'rgba(210,180,140,0.3)'}`, transition: 'all 0.3s' }}>{v}</div>
        );
      })}
    </div>
  );
}

function BSTViz({ step, allSteps, stepIdx }) {
  const inserted = allSteps.slice(0, stepIdx + 1).filter(s => s.insert !== undefined).map(s => s.insert);
  const values = [...inserted];

  const buildTree = (vals) => {
    if (!vals.length) return null;
    const tree = { val: vals[0], left: null, right: null };
    for (let i = 1; i < vals.length; i++) {
      let node = tree;
      while (true) {
        if (vals[i] < node.val) { if (!node.left) { node.left = { val: vals[i], left: null, right: null }; break; } else node = node.left; }
        else { if (!node.right) { node.right = { val: vals[i], left: null, right: null }; break; } else node = node.right; }
      }
    }
    return tree;
  };

  const tree = buildTree(values);
  const latest = step.insert;

  const renderNode = (node, depth = 0, x = 50, spread = 25) => {
    if (!node) return null;
    const y = depth * 70 + 40;
    const isNew = node.val === latest;
    return (
      <g key={`${node.val}-${depth}`}>
        {node.left && <line x1={`${x}%`} y1={y} x2={`${x - spread}%`} y2={y + 70} stroke="rgba(86,211,100,0.4)" strokeWidth="2" />}
        {node.right && <line x1={`${x}%`} y1={y} x2={`${x + spread}%`} y2={y + 70} stroke="rgba(86,211,100,0.4)" strokeWidth="2" />}
        <circle cx={`${x}%`} cy={y} r="20" fill={isNew ? '#56D364' : 'rgba(86,211,100,0.2)'} stroke={isNew ? '#56D364' : 'rgba(86,211,100,0.5)'} strokeWidth="2" />
        <text x={`${x}%`} y={y + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">{node.val}</text>
        {renderNode(node.left, depth + 1, x - spread, spread / 1.7)}
        {renderNode(node.right, depth + 1, x + spread, spread / 1.7)}
      </g>
    );
  };

  return (
    <svg width="100%" height="280" style={{ padding: '0.5rem' }}>
      {tree ? renderNode(tree) : <text x="50%" y="50%" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14">Empty BST</text>}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Visualizer = () => {
  const [selected, setSelected] = useState('array');
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [customInput, setCustomInput] = useState('5, 3, 8, 1, 9, 2, 7, 4');
  const [customTarget, setCustomTarget] = useState('9');
  
  const intervalRef = useRef(null);

  // Parse user input dynamically
  const parsedArray = customInput
    .split(',')
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n));
    
  const parsedTarget = parseInt(customTarget) || 9;

  const steps = genSteps(selected, parsedArray, parsedTarget);
  const step = steps[stepIdx] || {};
  const config = DS_LIST.find(d => d.id === selected);
  const guide = GFG_GUIDE[selected] || {};

  const reset = useCallback(() => { setStepIdx(0); setPlaying(false); }, []);
  const next = useCallback(() => setStepIdx(i => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const prev = useCallback(() => setStepIdx(i => Math.max(i - 1, 0)), []);

  useEffect(() => { reset(); }, [selected, reset, customInput, customTarget]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx(i => {
          if (i >= steps.length - 1) { setPlaying(false); return i; }
          return i + 1;
        });
      }, 950);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [playing, steps.length]);

  const renderViz = () => {
    switch (selected) {
      case 'array': return <ArrayViz step={step} />;
      case 'stack': return <StackViz step={step} />;
      case 'queue': return <QueueViz step={step} />;
      case 'linkedlist': return <LinkedListViz step={step} />;
      case 'bsearch': return <BSearchViz step={step} />;
      case 'bubblesort': return <BubbleSortViz step={step} />;
      case 'bst': return <BSTViz step={step} allSteps={steps} stepIdx={stepIdx} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>🎬 Interactive DSA Visualizer</h1>
        <p style={{ color: 'var(--color-dark-muted)' }}>Type your custom elements, watch algorithms execute in real time, and learn GeeksForGeeks pseudocodes.</p>
      </div>

      {/* Inputs Configuration Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark-muted)', marginBottom: '0.5rem' }}>
            <Settings size={14} /> CUSTOM INPUT (comma-separated numbers)
          </label>
          <input 
            type="text" 
            value={customInput} 
            onChange={(e) => setCustomInput(e.target.value)} 
            placeholder="e.g. 5, 3, 8, 1, 9, 2, 7, 4" 
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-dark-border)', borderRadius: '0.5rem', backgroundColor: 'var(--color-dark-700)', color: 'white', fontWeight: 600, fontSize: '0.85rem' }} 
          />
        </div>
        {selected === 'bsearch' && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-dark-muted)', marginBottom: '0.5rem' }}>
              🎯 SEARCH TARGET VALUE
            </label>
            <input 
              type="number" 
              value={customTarget} 
              onChange={(e) => setCustomTarget(e.target.value)} 
              placeholder="e.g. 9" 
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--color-dark-border)', borderRadius: '0.5rem', backgroundColor: 'var(--color-dark-700)', color: 'white', fontWeight: 600, fontSize: '0.85rem' }} 
            />
          </div>
        )}
      </div>

      {/* DS Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {DS_LIST.map(ds => (
          <button key={ds.id} onClick={() => setSelected(ds.id)} style={{ padding: '0.45rem 1rem', borderRadius: '0.5rem', border: `2px solid ${selected === ds.id ? ds.color : 'var(--color-dark-border)'}`, backgroundColor: selected === ds.id ? `${ds.color}18` : 'var(--color-dark-800)', color: selected === ds.id ? ds.color : 'var(--color-dark-muted)', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}>
            {ds.emoji} {ds.label}
          </button>
        ))}
      </div>

      {/* Main visualizer board */}
      <div style={{ backgroundColor: 'var(--color-dark-800)', border: `1px solid ${config.color}40`, borderRadius: '1rem', padding: '1.5rem', minHeight: 260 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{config.emoji} {config.label} Viewport</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-dark-muted)', backgroundColor: 'var(--color-dark-700)', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>Step {stepIdx + 1} / {steps.length}</span>
        </div>
        <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderViz()}
        </div>
      </div>

      {/* Dynamic step commentary info */}
      <div style={{ backgroundColor: `${config.color}12`, border: `1px solid ${config.color}30`, borderRadius: '0.75rem', padding: '0.85rem 1.25rem', color: 'white', fontSize: '0.88rem' }}>
        💡 <strong>Status:</strong> {step.info || ''}
      </div>

      {/* Visualizer Controls bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
        <button onClick={reset} title="Reset" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--color-dark-border)', backgroundColor: 'var(--color-dark-800)', color: 'var(--color-dark-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RotateCcw size={16} /></button>
        <button onClick={prev} disabled={stepIdx === 0} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--color-dark-border)', backgroundColor: 'var(--color-dark-800)', color: stepIdx === 0 ? 'var(--color-dark-border)' : 'white', cursor: stepIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
        <button onClick={() => setPlaying(p => !p)} style={{ padding: '0.5rem 1.75rem', borderRadius: '0.5rem', border: 'none', background: `linear-gradient(135deg, ${config.color}, ${config.color}99)`, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {playing ? <><Pause size={16} /> Pause</> : <><Play size={16} /> {stepIdx === steps.length - 1 ? 'Replay' : 'Play'}</>}
        </button>
        <button onClick={next} disabled={stepIdx === steps.length - 1} style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--color-dark-border)', backgroundColor: 'var(--color-dark-800)', color: stepIdx === steps.length - 1 ? 'var(--color-dark-border)' : 'white', cursor: stepIdx === steps.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
      </div>

      {/* Real-time progression bar */}
      <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${((stepIdx + 1) / steps.length) * 100}%`, height: '100%', backgroundColor: config.color, borderRadius: 2, transition: 'width 0.35s ease' }} />
      </div>

      {/* GeeksForGeeks Detailed Curriculum Concept Guide */}
      <div style={{ backgroundColor: 'var(--color-dark-800)', border: '1px solid var(--color-dark-border)', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontSize: '1.05rem', fontWeight: 800 }}>
          <BookOpen size={18} color="#3FB950" /> GeeksForGeeks Reference Concept Guide
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '0.5rem', borderLeft: `3px solid ${config.color}` }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-dark-muted)' }}>TIME COMPLEXITY</span>
            <div style={{ fontSize: '0.9rem', color: '#56D364', fontWeight: 700, marginTop: '0.25rem' }}>{guide.time}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.85rem 1rem', borderRadius: '0.5rem', borderLeft: `3px solid ${config.color}` }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-dark-muted)' }}>SPACE COMPLEXITY</span>
            <div style={{ fontSize: '0.9rem', color: '#58A6FF', fontWeight: 700, marginTop: '0.25rem' }}>{guide.space}</div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark-muted)', marginBottom: '0.5rem' }}>CONCEPT THEORY</h4>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{guide.theory}</p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-dark-muted)', marginBottom: '0.5rem' }}>GFG PSEUDOCODE IMPLEMENTATION</h4>
          <pre style={{ backgroundColor: 'var(--color-dark-900)', border: '1px solid var(--color-dark-border)', borderRadius: '0.5rem', padding: '1rem', color: '#58A6FF', fontSize: '0.82rem', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.5 }}>
            {guide.pseudocode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
