"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  let animationId: number
  let webgl: WebGLRenderingContext | null = null
  let programInfo: any = null
  let startTime: number

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const reasonStr = typeof reason === "string" ? reason : reason?.message || String(reason)

      const walletErrorPatterns = [
        "MetaMask",
        "Failed to connect to MetaMask",
        "s: Failed to connect",
        "ethereum",
        "web3",
        "wallet",
        "injected provider",
        "connection failed",
      ]

      const isWalletError = walletErrorPatterns.some((pattern) =>
        reasonStr.toLowerCase().includes(pattern.toLowerCase()),
      )

      if (isWalletError) {
        event.preventDefault()
        console.warn("[v0] Suppressed external wallet error:", reasonStr)
        return
      }
    }

    const handleError = (event: ErrorEvent) => {
      const message = event.message || event.error?.message || ""
      const walletErrorPatterns = [
        "MetaMask",
        "Failed to connect to MetaMask",
        "s: Failed to connect",
        "ethereum",
        "web3",
        "wallet",
      ]

      const isWalletError = walletErrorPatterns.some((pattern) => message.toLowerCase().includes(pattern.toLowerCase()))

      if (isWalletError) {
        event.preventDefault()
        console.warn("[v0] Suppressed external wallet error:", message)
        return
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection, true)
    window.addEventListener("error", handleError, true)

    const initializeAnimation = async () => {
      try {
        const canvas = canvasRef.current
        if (!canvas) return

        webgl = canvas.getContext("webgl")
        if (!webgl) {
          console.error("WebGL not supported in your browser")
          return
        }

        const vsSource = `
          attribute vec4 aVertexPosition;
          void main() {
            gl_Position = aVertexPosition;
          }
        `

        const fsSource = `
          precision highp float;
          uniform vec2 iResolution;
          uniform float iTime;

          const float overallSpeed = 0.2;
          const float gridSmoothWidth = 0.015;
          const float axisWidth = 0.05;
          const float majorLineWidth = 0.025;
          const float minorLineWidth = 0.0125;
          const float majorLineFrequency = 5.0;
          const float minorLineFrequency = 1.0;
          const vec4 gridColor = vec4(0.5);
          const float scale = 5.0;
          const vec4 lineColor = vec4(0.4, 0.2, 0.8, 1.0);
          const float minLineWidth = 0.01;
          const float maxLineWidth = 0.2;
          const float lineSpeed = 1.0 * overallSpeed;
          const float lineAmplitude = 1.0;
          const float lineFrequency = 0.2;
          const float warpSpeed = 0.2 * overallSpeed;
          const float warpFrequency = 0.5;
          const float warpAmplitude = 1.0;
          const float offsetFrequency = 0.5;
          const float offsetSpeed = 1.33 * overallSpeed;
          const float minOffsetSpread = 0.6;
          const float maxOffsetSpread = 2.0;
          const int linesPerGroup = 16;

          #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
          #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
          #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
          #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

          float drawGridLines(float axis) {
            return drawCrispLine(0.0, axisWidth, axis)
                 + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
                 + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
          }

          float drawGrid(vec2 space) {
            return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
          }

          float random(float t) {
            return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
          }

          float getPlasmaY(float x, float horizontalFade, float offset) {
            return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
          }

          void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            vec4 fragColor;

            vec2 uv = fragCoord.xy / iResolution.xy;
            vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

            float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
            float verticalFade   = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

            space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
            space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

            vec4 lines = vec4(0.0);

            vec4 bgColor1 = vec4(0.1, 0.1, 0.3, 1.0);
            vec4 bgColor2 = vec4(0.3, 0.1, 0.5, 1.0);

            for (int l = 0; l < linesPerGroup; l++) {
              float normalizedLineIndex = float(l) / float(linesPerGroup);
              float offsetTime     = iTime * offsetSpeed;
              float offsetPosition = float(l) + space.x * offsetFrequency;
              float rand           = random(offsetPosition + offsetTime) * 0.5 + 0.5;
              float halfWidth      = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
              float offset         = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex))
                                   * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
              float linePosition   = getPlasmaY(space.x, horizontalFade, offset);

              float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0
                         + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

              float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
              vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
              float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

              lines += (line + circle) * lineColor * rand;
            }

            fragColor = mix(bgColor1, bgColor2, uv.x);
            fragColor *= verticalFade;
            fragColor += lines;
            fragColor.a = 1.0;

            gl_FragColor = fragColor;
          }
        `

        function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
          const shader = gl.createShader(type)
          if (!shader) return null

          gl.shaderSource(shader, source)
          gl.compileShader(shader)

          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compile error:", gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            return null
          }
          return shader
        }

        function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
          const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
          const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

          if (!vertexShader || !fragmentShader) return null

          const shaderProgram = gl.createProgram()
          if (!shaderProgram) return null

          gl.attachShader(shaderProgram, vertexShader)
          gl.attachShader(shaderProgram, fragmentShader)
          gl.linkProgram(shaderProgram)

          if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error("Unable to link the shader program:", gl.getProgramInfoLog(shaderProgram))
            return null
          }
          return shaderProgram
        }

        const shaderProgram = initShaderProgram(webgl, vsSource, fsSource)
        if (!shaderProgram) return

        const positionBuffer = webgl.createBuffer()
        webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer)
        webgl.bufferData(
          webgl.ARRAY_BUFFER,
          new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
          webgl.STATIC_DRAW,
        )

        programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: webgl.getAttribLocation(shaderProgram, "aVertexPosition"),
          },
          uniformLocations: {
            resolution: webgl.getUniformLocation(shaderProgram, "iResolution"),
            time: webgl.getUniformLocation(shaderProgram, "iTime"),
          },
        }

        function resizeCanvas() {
          if (!canvas) return
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          if (webgl) {
            webgl.viewport(0, 0, canvas.width, canvas.height)
          }
        }

        window.addEventListener("resize", resizeCanvas)
        resizeCanvas()

        startTime = Date.now()

        const render = () => {
          const currentTime = (Date.now() - startTime) / 1000

          if (webgl) {
            webgl.clearColor(0.0, 0.0, 0.0, 1.0)
            webgl.clear(webgl.COLOR_BUFFER_BIT)

            webgl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height)
            webgl.uniform1f(programInfo.uniformLocations.time, currentTime)

            webgl.bindBuffer(webgl.ARRAY_BUFFER, positionBuffer)
            webgl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, webgl.FLOAT, false, 0, 0)
            webgl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)

            // Moved webgl.useProgram to the top to avoid conditional hook call
            webgl.useProgram(programInfo.program)

            webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4)
          }

          animationId = requestAnimationFrame(render)
        }

        animationId = requestAnimationFrame(render)
      } catch (error) {
        console.warn("Background animation initialization failed (non-critical):", error)
      }
    }

    initializeAnimation()

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
      window.removeEventListener("error", handleError, true)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" style={{ width: "100%", height: "100%" }} />
  )
}
