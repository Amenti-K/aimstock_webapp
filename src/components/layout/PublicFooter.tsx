"use client";

import logo from "@/../public/logo.png";
import Link from "next/link";
import {
  LayoutDashboard,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  HelpCircle,
} from "lucide-react";
import { FaTiktok, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";

import { AIMSTOCK_DATA } from "@/lib/data";
import Image from "next/image";

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  Facebook: Facebook,
  Instagram: Instagram,
  LinkedIn: Linkedin,
  TikTok: FaTiktok,
  Telegram: FaTelegramPlane,
  Whatsapp: FaWhatsapp,
  Twitter: Twitter,
};

export const PublicFooter = () => {
  return (
    <footer className="bg-foreground text-background dark:bg-card dark:text-foreground border-t dark:border-border">
      <div className="container mx-auto px-4 py-16 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image src={logo} alt="Logo" width={30} height={30} />
              <span className="text-xl font-bold">
                AIM <span className="text-primary">Stock</span>
              </span>
            </Link>

            <p className="text-muted-foreground max-w-xs">
              {AIMSTOCK_DATA.brand.description}
            </p>

            <div className="flex space-x-4">
              {AIMSTOCK_DATA.socialLinks.map((item) => {
                const Icon = SOCIAL_ICONS[item.name] || HelpCircle;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="hover:text-primary transition group/icon"
                    title={item.name}
                  >
                    <Icon
                      size={18}
                      className="transition-transform group-hover/icon:scale-150"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Product</h4>
            <ul className="space-y-4">
              {AIMSTOCK_DATA.productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Support</h4>
            <ul className="space-y-4">
              {AIMSTOCK_DATA.supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Contact</h4>

            <div className="space-y-5 text-muted-foreground">
              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 flex-shrink-0 mt-1 flex items-center justify-center">
                  <Mail size={18} className="text-primary" />
                </div>
                <span className="text-sm leading-relaxed">
                  {AIMSTOCK_DATA.contact.email}
                </span>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 flex-shrink-0 mt-1 flex items-center justify-center">
                  <Phone size={18} className="text-primary" />
                </div>
                <span className="text-sm leading-relaxed">
                  {AIMSTOCK_DATA.contact.phone}
                </span>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-5 h-5 flex-shrink-0 mt-1 flex items-center justify-center">
                  <MapPin size={18} className="text-primary" />
                </div>
                <span className="text-sm leading-relaxed">
                  {AIMSTOCK_DATA.contact.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 dark:border-border text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AIM Stock. Built for real businesses.
          </p>
        </div>
      </div>
    </footer>
  );
};
