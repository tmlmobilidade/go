'use client';

import { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec3 position;
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform float xScale;
  uniform float yScale;
  uniform float distortion;

  void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    float d = length(p) * distortion;
    float rx = p.x * (1.0 + d);
    float gx = p.x;
    float bx = p.x * (1.0 - d);
    float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
    float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
    float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export function Background2() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const glRef = useRef<null | WebGLRenderingContext>(null);
	const programRef = useRef<null | WebGLProgram>(null);
	const uniformsRef = useRef<null | {
		distortion: null | WebGLUniformLocation
		resolution: null | WebGLUniformLocation
		time: null | WebGLUniformLocation
		xScale: null | WebGLUniformLocation
		yScale: null | WebGLUniformLocation
	}>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const gl = canvas.getContext('webgl');
		if (!gl) return;
		glRef.current = gl;

		// Compile shaders
		const compileShader = (source: string, type: GLenum) => {
			const shader = gl.createShader(type);
			if (!shader) return null;
			gl.shaderSource(shader, source);
			gl.compileShader(shader);
			if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
				console.error('Shader error:', gl.getShaderInfoLog(shader));
				return null;
			}
			return shader;
		};

		const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
		if (!vertexShader) return;
		const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
		if (!fragmentShader) return;

		// Create and link program
		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Program error:', gl.getProgramInfoLog(program));
			return;
		}
		programRef.current = program;

		// Set up geometry
		const vertices = new Float32Array([
			-1, -1, 1, -1, -1, 1,
			1, -1, -1, 1, 1, 1,
		]);
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		const positionLocation = gl.getAttribLocation(program, 'position');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		// Get uniform locations
		uniformsRef.current = {
			distortion: gl.getUniformLocation(program, 'distortion'),
			resolution: gl.getUniformLocation(program, 'resolution'),
			time: gl.getUniformLocation(program, 'time'),
			xScale: gl.getUniformLocation(program, 'xScale'),
			yScale: gl.getUniformLocation(program, 'yScale'),
		};

		const render = (time: number) => {
			time *= 0.0003;
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(program);

			if (!uniformsRef.current) return;

			gl.uniform2f(uniformsRef.current.resolution, gl.canvas.width, gl.canvas.height);
			gl.uniform1f(uniformsRef.current.time, time);
			gl.uniform1f(uniformsRef.current.xScale, 1.0);
			gl.uniform1f(uniformsRef.current.yScale, 0.5);
			gl.uniform1f(uniformsRef.current.distortion, 0.05);

			gl.drawArrays(gl.TRIANGLES, 0, 6);
			requestAnimationFrame(render);
		};

		render(0);

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			gl.viewport(0, 0, canvas.width, canvas.height);
		};
		window.addEventListener('resize', resize);
		resize();
		return () => window.removeEventListener('resize', resize);
	}, []);

	return <canvas ref={canvasRef} style={{ height: '100%', left: 0, position: 'absolute', top: 0, width: '100%', zIndex: 0 }} />;
};
