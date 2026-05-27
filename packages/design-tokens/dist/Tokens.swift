// AUTO-GENERATED FROM tokens.json — DO NOT EDIT

import SwiftUI

extension Color {
  init(hex: UInt32, alpha: Double = 1.0) {
    let r = Double((hex >> 16) & 0xff) / 255
    let g = Double((hex >> 8) & 0xff) / 255
    let b = Double(hex & 0xff) / 255
    self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
  }
}

extension Color {
  static let veldgroen   = Color(hex: 0x7B9D7A)
  static let eersteLicht = Color(hex: 0xE8A65A)
  static let inkt        = Color(hex: 0x0D1014)
  static let krijt       = Color(hex: 0xF6F5F1)
  static let mist        = Color(hex: 0x6B7680)
  static let stof        = Color(hex: 0xEFEDE5)
  static let nacht       = Color(hex: 0x1B2531)
  static let steen       = Color(hex: 0x8C8678)
  static let houtskool   = Color(hex: 0x3A4A52)
}

enum Spacing {
  static let s1: CGFloat = 4
  static let s2: CGFloat = 8
  static let s3: CGFloat = 12
  static let s4: CGFloat = 16
  static let s5: CGFloat = 22
  static let s6: CGFloat = 30
  static let s7: CGFloat = 36
  static let s8: CGFloat = 44
}

enum Motion {
  static let transition = Animation.easeOut(duration: 0.22)
}
