import AVFoundation
import Foundation

guard CommandLine.arguments.count > 1 else { exit(2) }
let url = URL(fileURLWithPath: CommandLine.arguments[1])
let file = try AVAudioFile(forReading: url)
let format = file.processingFormat
let frameCount = AVAudioFrameCount(file.length)
guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { exit(3) }
try file.read(into: buffer)
guard let channels = buffer.floatChannelData else { exit(4) }

let sampleRate = format.sampleRate
let window = max(1, Int(sampleRate * 0.02))
let frames = Int(buffer.frameLength)
var rms: [Float] = []
var peak: Float = 0

for start in stride(from: 0, to: frames, by: window) {
  let end = min(frames, start + window)
  var sum: Float = 0
  for i in start..<end {
    let value = channels[0][i]
    sum += value * value
  }
  let value = sqrt(sum / Float(max(1, end - start)))
  rms.append(value)
  peak = max(peak, value)
}

let threshold = peak * 0.035
var raw: [(Double, Double)] = []
var activeStart: Int? = nil
for (index, value) in rms.enumerated() {
  if value > threshold && activeStart == nil { activeStart = index }
  if value <= threshold, let start = activeStart {
    if Double(index - start) * 0.02 >= 0.08 {
      raw.append((Double(start) * 0.02, Double(index) * 0.02))
    }
    activeStart = nil
  }
}
if let start = activeStart { raw.append((Double(start) * 0.02, Double(rms.count) * 0.02)) }

var merged: [(Double, Double)] = []
for segment in raw {
  if let last = merged.last, segment.0 - last.1 < 0.16 {
    merged[merged.count - 1] = (last.0, segment.1)
  } else {
    merged.append(segment)
  }
}

print("duration=\(Double(frames) / sampleRate) peak=\(peak) threshold=\(threshold) segments=\(merged.count)")
for (index, segment) in merged.enumerated() {
  print(String(format: "%02d %.3f %.3f %.3f", index + 1, segment.0, segment.1, segment.1 - segment.0))
}
