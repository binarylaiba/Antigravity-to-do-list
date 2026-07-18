import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

export default function App() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Ref to hold the DOM elements for each task so Matter.js can sync them
  const taskDOMRefs = useRef({});

  useEffect(() => {
    // 1. Setup Matter.js Engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;
    engineRef.current = engine;

    // 2. Setup Renderer
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
      }
    });
    renderRef.current = render;
    Matter.Render.run(render);

    // 3. Setup Runner
    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    // 4. Create World Boundaries
    const wallOptions = { isStatic: true, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 100, wallOptions),
      Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, wallOptions),
      Matter.Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, wallOptions),
      Matter.Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, wallOptions)
    ];
    Matter.Composite.add(engine.world, walls);

    // 5. Setup Mouse Control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // 6. Handle Resize
    const handleResize = () => {
      if (!render.canvas) return;
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      
      Matter.Body.setPosition(walls[0], { x: window.innerWidth / 2, y: -50 });
      Matter.Body.setPosition(walls[1], { x: window.innerWidth / 2, y: window.innerHeight + 50 });
      Matter.Body.setPosition(walls[2], { x: -50, y: window.innerHeight / 2 });
      Matter.Body.setPosition(walls[3], { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    };
    window.addEventListener('resize', handleResize);

    // 7. Core Update Loop (Sync DOM and Black Hole Logic)
    Matter.Events.on(engine, 'afterUpdate', () => {
      const currentTasks = Matter.Composite.allBodies(engine.world).filter(b => b.label === 'task');
      
      currentTasks.forEach(body => {
        // Sync DOM element position/rotation
        const el = taskDOMRefs.current[body.id];
        if (el) {
          el.style.left = `${body.position.x}px`;
          el.style.top = `${body.position.y}px`;
          el.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
        }

        // Black Hole Attraction
        const blackHolePos = { x: window.innerWidth, y: window.innerHeight };
        const dx = blackHolePos.x - body.position.x;
        const dy = blackHolePos.y - body.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attraction Force (Gravity Well)
        if (dist < 350) {
          const forceMagnitude = 0.003 * body.mass;
          Matter.Body.applyForce(body, body.position, {
            x: (dx / dist) * forceMagnitude,
            y: (dy / dist) * forceMagnitude
          });
        }

        // Deletion (Event Horizon)
        if (dist < 100) {
          // Remove from physics world
          Matter.Composite.remove(engine.world, body);
          
          // Trigger visual feedback (using a quick state flag or direct DOM manipulation for performance)
          const bh = document.getElementById('black-hole');
          if (bh) {
            bh.classList.add('scale-110', 'shadow-[0_0_100px_40px_rgba(0,255,255,0.8)]');
            setTimeout(() => {
              bh.classList.remove('scale-110', 'shadow-[0_0_100px_40px_rgba(0,255,255,0.8)]');
            }, 200);
          }

          // Remove from React state
          setTasks(prev => {
            const newTasks = prev.filter(t => t.id !== body.id);
            // Cleanup DOM ref
            delete taskDOMRefs.current[body.id];
            return newTasks;
          });
        }
      });
    });

    // Initial default tasks
    addTask('Buy space food 🚀', engine);
    addTask('Fix the hyperdrive 🔧', engine);
    addTask('Water the space plants 🌿', engine);

    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
      render.canvas = null;
      render.context = null;
      render.textures = {};
    };
  }, []); // Run once on mount

  // Helper to add physics body and update React state
  const addTask = (text, engineInstance = engineRef.current) => {
    if (!text.trim() || !engineInstance) return;

    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
    const width = Math.max(100, text.length * 12);
    const height = 46;

    const body = Matter.Bodies.rectangle(startX, startY, width, height, {
      label: 'task',
      restitution: 0.8,
      frictionAir: 0.015,
      render: {
        fillStyle: 'rgba(255, 255, 255, 0.05)',
        strokeStyle: 'rgba(0, 255, 255, 0.6)',
        lineWidth: 2
      }
    });

    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6
    });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

    Matter.Composite.add(engineInstance.world, body);
    
    // Add to React state so it renders the DOM node
    setTasks(prev => [...prev, { id: body.id, text }]);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addTask(inputValue);
    setInputValue('');
  };

  return (
    <>
      {/* Matter.js Canvas Container */}
      <div ref={sceneRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {/* Dynamic Task Labels controlled by Matter.js position */}
      {tasks.map(task => (
        <div
          key={task.id}
          ref={el => taskDOMRefs.current[task.id] = el}
          className="task-label"
        >
          {task.text}
        </div>
      ))}

      {/* UI Overlay */}
      <div className="absolute top-[30px] left-1/2 -translate-x-1/2 z-10 text-center glass-panel p-6 w-[90%] max-w-[500px]">
        <h1 className="text-3xl mb-5 neon-text font-bold">Zero-Gravity Tasks</h1>
        
        <form onSubmit={handleAddSubmit} className="flex gap-2.5 mb-4">
          <input
            type="text"
            className="flex-1 glass-input"
            placeholder="Type a task..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="neon-button">
            Add
          </button>
        </form>
        
        <p className="text-sm text-white/60">
          Grab tasks with your mouse. Throw them into the black hole to delete.
        </p>
      </div>

      {/* Black Hole */}
      <div 
        id="black-hole"
        className="absolute -bottom-[80px] -right-[80px] w-[250px] h-[250px] rounded-full z-0 pointer-events-none transition-all duration-200 animate-rotate-bh animate-pulse-bh shadow-[0_0_60px_20px_rgba(74,0,224,0.5)]"
        style={{
          background: 'radial-gradient(circle, #000 30%, #4a00e0 60%, transparent 80%)'
        }}
      />
    </>
  );
}
