import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";
import { gsap } from "gsap";

const PURPLE = new THREE.Color("#a266ff");
const PURPLE_DEEP = new THREE.Color("#6a2bd9");
const PURPLE_BRIGHT = new THREE.Color("#d9bfff");

/* ---------------- Portal ring ---------------- */
function PortalRing({
  yRef,
  radius = 1,
  segments = 3,
  rotationSpeed = 0.15,
  opacityRef,
}) {
  const group = useRef(null);

  const layers = useMemo(() => {
    // 0 = outer (broken segmented arcs)
    // 1 = middle (solid segmented lines)
    // 2 = inner (brightest glow)
    return [
      {
        r: radius,
        thickness: 0.01,
        gapRatio: 0.45,
        segs: segments + 6,
        color: PURPLE,
        dir: 1,
      },
      {
        r: radius * 0.86,
        thickness: 0.014,
        gapRatio: 0.18,
        segs: segments + 1,
        color: PURPLE,
        dir: -1,
      },
      {
        r: radius * 0.72,
        thickness: 0.02,
        gapRatio: 0.0,
        segs: 1,
        color: PURPLE_BRIGHT,
        dir: 1,
      },
    ];
  }, [radius, segments]);

  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.position.y = yRef.current;
    group.current.children.forEach((child, i) => {
      child.rotation.z += dt * rotationSpeed * (layers[i]?.dir ?? 1);
      child.traverse((o) => {
        if (o.material && "opacity" in o.material) {
          o.material.opacity = opacityRef.current;
        }
      });
    });
  });

  return (
    <group ref={group} rotation={[Math.PI / 2, 0, 0]}>
      {layers.map((l, idx) => {
        const arcs = [];
        const segLen = (Math.PI * 2) / l.segs;
        const gap = segLen * l.gapRatio;
        const arc = segLen - gap;
        for (let i = 0; i < l.segs; i++) {
          const start = i * segLen;
          const geom = new THREE.RingGeometry(
            l.r - l.thickness,
            l.r + l.thickness,
            64,
            1,
            start,
            arc,
          );
          arcs.push(
            <mesh key={i} geometry={geom}>
              <meshBasicMaterial
                color={l.color}
                transparent
                opacity={1}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>,
          );
        }
        return (
          <group key={idx}>
            <mesh>
              <ringGeometry args={[l.r - l.thickness, l.r + l.thickness, 64]} />
              <meshBasicMaterial visible={false} />
            </mesh>
            {arcs}
          </group>
        );
      })}
    </group>
  );
}

/* ---------------- Floating Key ---------------- */
function HoloKey({ opacityRef }) {
  const group = useRef(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    if (!group.current) return;
    group.current.position.y = Math.sin(t.current * 1.2) * 0.05;
    group.current.rotation.y += dt * 0.25;
    group.current.traverse((o) => {
      const m = o.material;
      if (m && "opacity" in m) {
        m.opacity = (m.userData?.baseOpacity ?? 1) * opacityRef.current;
      }
    });
  });

  const tintMat = (color, base) => {
    const m = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: base,
      toneMapped: false,
    });
    m.userData = { baseOpacity: base };
    return m;
  };

  const edgeMat = useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color: PURPLE,
      transparent: true,
      opacity: 1,
      toneMapped: false,
    });
    m.userData = { baseOpacity: 1 };
    return m;
  }, []);

  const shaftGeom = useMemo(
    () => new THREE.CylinderGeometry(0.012, 0.012, 0.55, 12),
    [],
  );
  const bowOuterGeom = useMemo(
    () => new THREE.TorusGeometry(0.1, 0.01, 12, 64),
    [],
  );
  const bowPetalGeom = useMemo(
    () => new THREE.TorusGeometry(0.055, 0.008, 10, 40),
    [],
  );
  const bowCenterGeom = useMemo(
    () => new THREE.TorusGeometry(0.025, 0.007, 10, 28),
    [],
  );
  const collarGeom = useMemo(
    () => new THREE.TorusGeometry(0.022, 0.008, 10, 28),
    [],
  );
  const tooth1Geom = useMemo(
    () => new THREE.BoxGeometry(0.012, 0.055, 0.012),
    [],
  );
  const tooth2Geom = useMemo(
    () => new THREE.BoxGeometry(0.012, 0.04, 0.012),
    [],
  );
  const tooth3Geom = useMemo(
    () => new THREE.BoxGeometry(0.012, 0.03, 0.012),
    [],
  );

  const glassMatShaft = useMemo(() => tintMat(PURPLE_DEEP, 0.22), []);
  const glassMatBow = useMemo(() => tintMat(PURPLE_DEEP, 0.18), []);
  const glassMatTeeth = useMemo(() => tintMat(PURPLE_DEEP, 0.22), []);

  return (
    <group ref={group} rotation={[0, 0, -Math.PI * 0.25]} scale={1.05}>
      <mesh
        geometry={shaftGeom}
        material={glassMatShaft}
        rotation={[0, 0, Math.PI / 2]}
      />
      <lineSegments material={edgeMat} rotation={[0, 0, Math.PI / 2]}>
        <edgesGeometry args={[shaftGeom]} />
      </lineSegments>

      <mesh
        geometry={collarGeom}
        material={glassMatBow}
        position={[-0.18, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <lineSegments
        material={edgeMat}
        position={[-0.18, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <edgesGeometry args={[collarGeom]} />
      </lineSegments>

      <mesh
        geometry={bowOuterGeom}
        material={glassMatBow}
        position={[-0.32, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <lineSegments
        material={edgeMat}
        position={[-0.32, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <edgesGeometry args={[bowOuterGeom]} />
      </lineSegments>
      {[0, 1, 2, 3].map((i) => {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const px = -0.32;
        const py = Math.sin(a) * 0.05;
        const pz = Math.cos(a) * 0.05;
        return (
          <group key={i} position={[px, py, pz]} rotation={[0, Math.PI / 2, a]}>
            <mesh geometry={bowPetalGeom} material={glassMatBow} />
            <lineSegments material={edgeMat}>
              <edgesGeometry args={[bowPetalGeom]} />
            </lineSegments>
          </group>
        );
      })}
      <mesh
        geometry={bowCenterGeom}
        material={glassMatBow}
        position={[-0.32, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <lineSegments
        material={edgeMat}
        position={[-0.32, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <edgesGeometry args={[bowCenterGeom]} />
      </lineSegments>

      <mesh
        geometry={tooth1Geom}
        material={glassMatTeeth}
        position={[0.24, -0.033, 0]}
      />
      <lineSegments material={edgeMat} position={[0.24, -0.033, 0]}>
        <edgesGeometry args={[tooth1Geom]} />
      </lineSegments>
      <mesh
        geometry={tooth2Geom}
        material={glassMatTeeth}
        position={[0.19, -0.025, 0]}
      />
      <lineSegments material={edgeMat} position={[0.19, -0.025, 0]}>
        <edgesGeometry args={[tooth2Geom]} />
      </lineSegments>
      <mesh
        geometry={tooth3Geom}
        material={glassMatTeeth}
        position={[0.14, -0.02, 0]}
      />
      <lineSegments material={edgeMat} position={[0.14, -0.02, 0]}>
        <edgesGeometry args={[tooth3Geom]} />
      </lineSegments>
    </group>
  );
}

/* ---------------- Digital Rain Particles ---------------- */
function Particles({ topYRef, bottomY, radius, opacityRef, count = 110 }) {
  const meshRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorAttr = useRef(new Float32Array(count * 3));

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const x = (Math.random() * 2 - 1) * radius * 0.95;
      const z = (Math.random() * 2 - 1) * radius * 0.3;
      const y = bottomY + Math.random() * 2;
      const speed = 0.9 + Math.random() * 1.1;
      const length = 0.08 + Math.random() * 0.12;
      const bright = Math.random() < 0.18;
      return { x, y, z, speed, length, bright, i };
    });
  }, [count, radius, bottomY]);

  useEffect(() => {
    if (!meshRef.current) return;
    data.forEach((p) => {
      const c = p.bright ? PURPLE_BRIGHT : PURPLE;
      colorAttr.current[p.i * 3] = c.r;
      colorAttr.current[p.i * 3 + 1] = c.g;
      colorAttr.current[p.i * 3 + 2] = c.b;
    });
    meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(
      colorAttr.current,
      3,
    );
    meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    const top = topYRef.current;
    const span = top - bottomY;
    if (span <= 0) return;

    const mat = meshRef.current.material;
    mat.opacity = opacityRef.current;

    data.forEach((p) => {
      p.y -= p.speed * dt;
      if (p.y < bottomY) {
        p.y = top + Math.random() * 0.3;
        p.x = (Math.random() * 2 - 1) * radius * 0.95;
        p.z = (Math.random() * 2 - 1) * radius * 0.3;
      }
      const distFromBottom = p.y - bottomY;
      const fade = Math.min(1, distFromBottom / 0.25);
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(1, p.length * 8 * fade, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(p.i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.006, 0.02]} />
      <meshBasicMaterial
        transparent
        opacity={1}
        toneMapped={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ---------------- Scene ---------------- */
function Scene({ phase }) {
  const TOP_Y_FINAL = 0.55;
  const BOTTOM_Y = -0.55;
  const RADIUS = 0.95;

  const topYRef = useRef(BOTTOM_Y);
  const bottomYRef = useRef(BOTTOM_Y);

  const topRingOpacityRef = useRef(0);
  const bottomRingOpacityRef = useRef(0);
  const keyOpacityRef = useRef(0);
  const particlesOpacityRef = useRef(0);

  useEffect(() => {
    const tl = gsap.timeline();
    if (phase === "in") {
      tl.to(
        bottomRingOpacityRef,
        { current: 1, duration: 0.35, ease: "power2.out" },
        0,
      );
      tl.to(
        topRingOpacityRef,
        { current: 1, duration: 0.3, ease: "power2.out" },
        0.2,
      );
      tl.to(
        topYRef,
        { current: TOP_Y_FINAL, duration: 0.5, ease: "power3.out" },
        0.25,
      );
      tl.to(
        particlesOpacityRef,
        { current: 1, duration: 0.5, ease: "power2.out" },
        0.35,
      );
      tl.to(
        keyOpacityRef,
        { current: 1, duration: 0.5, ease: "power2.out" },
        0.85,
      );
    } else if (phase === "out") {
      tl.to(
        particlesOpacityRef,
        { current: 0, duration: 0.25, ease: "power2.in" },
        0,
      );
      tl.to(
        keyOpacityRef,
        { current: 0, duration: 0.3, ease: "power2.in" },
        0.05,
      );
      tl.to(
        topYRef,
        { current: BOTTOM_Y, duration: 0.5, ease: "power3.in" },
        0.25,
      );
      tl.to(
        topRingOpacityRef,
        { current: 0, duration: 0.2, ease: "power1.in" },
        0.7,
      );
      tl.to(
        bottomRingOpacityRef,
        { current: 0, duration: 0.2, ease: "power1.in" },
        0.7,
      );
    }
    return () => {
      tl.kill();
    };
  }, [phase]);

  return (
    <>
      <PortalRing
        yRef={topYRef}
        radius={RADIUS}
        opacityRef={topRingOpacityRef}
        rotationSpeed={0.18}
      />
      <PortalRing
        yRef={bottomYRef}
        radius={RADIUS}
        opacityRef={bottomRingOpacityRef}
        rotationSpeed={-0.14}
      />
      <Particles
        topYRef={topYRef}
        bottomY={BOTTOM_Y}
        radius={RADIUS}
        opacityRef={particlesOpacityRef}
      />
      <group>
        <HoloKey opacityRef={keyOpacityRef} />
      </group>
    </>
  );
}

/* ---------------- Loader Wrapper ---------------- */
export function DreamKeyLoader() {
  const [phase, setPhase] = useState("in");

  useEffect(() => {
    let t1, t2, t3;
    const cycle = () => {
      setPhase("in");
      t1 = window.setTimeout(() => setPhase("loop"), 1500);
      t2 = window.setTimeout(() => setPhase("out"), 4600);
      t3 = window.setTimeout(() => cycle(), 5800);
    };
    cycle();
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div
        className="relative"
        style={{ height: "26vh", aspectRatio: "1 / 1" }}
      >
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <Scene phase={phase} />
          <EffectComposer>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.15}
              luminanceSmoothing={0.6}
              kernelSize={KernelSize.LARGE}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.85} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute bottom-[28%] left-1/2 -translate-x-1/2 text-center">
        <div
          className="text-[10px] font-medium uppercase tracking-[0.5em]"
          style={{ color: "rgba(210,190,255,0.55)" }}
        >
          Dream Key
        </div>
      </div>
    </div>
  );
}

export default DreamKeyLoader;
