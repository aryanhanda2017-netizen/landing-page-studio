import Foundation
import Vision
import CoreImage
for path in CommandLine.arguments.dropFirst() {
  guard let ci = CIImage(contentsOf: URL(fileURLWithPath: path)) else { continue }
  let req = VNDetectFaceRectanglesRequest()
  try? VNImageRequestHandler(ciImage: ci).perform([req])
  for f in req.results ?? [] {
    let b = f.boundingBox
    print(path.split(separator: "/").last!, String(format: "x=%.3f y=%.3f w=%.3f h=%.3f", b.minX, 1 - b.maxY, b.width, b.height))
  }
}
