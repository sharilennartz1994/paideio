"use client";

import {
  forwardRef,
  type ComponentType,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import {
  PAIDEIO_ICON_NAMES,
  type PaideioIconName,
} from "@/components/icons/paideio-icon-names";
import { cn } from "@/lib/utils";

export type PaideioIconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number | string;
  strokeWidth?: number;
};

export type LucideIcon = ComponentType<PaideioIconProps>;

export { PAIDEIO_ICON_NAMES };
export type { PaideioIconName };

export const PaideioGlyph = forwardRef<
  HTMLSpanElement,
  PaideioIconProps & { name: PaideioIconName }
>(({ name, className, size, style, "aria-hidden": ariaHidden, ...props }, ref) => {
  const mask = `url("/design/icons/${name}.png")`;
  return (
    <span
      ref={ref}
      data-paideio-icon={name}
      aria-hidden={ariaHidden ?? (props["aria-label"] ? undefined : true)}
      className={cn("inline-block size-5 shrink-0 bg-current align-middle", className)}
      style={{
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...(size ? { width: size, height: size } : {}),
        ...style,
      } as CSSProperties}
      {...props}
    />
  );
});
PaideioGlyph.displayName = "PaideioGlyph";

function createPaideioIcon(asset: string, displayName: string) {
  const Icon = forwardRef<HTMLSpanElement, PaideioIconProps>(
    (props, ref) => <PaideioGlyph ref={ref} name={asset as PaideioIconName} {...props} />
  );
  Icon.displayName = `Paideio${displayName}`;
  return Icon;
}

export const ArrowRight = createPaideioIcon("arrow", "ArrowRight");
export const MoveRight = ArrowRight;
export const Trophy = createPaideioIcon("trophy", "Trophy");
export const Award = Trophy;
export const Medal = Trophy;
export const Bell = createPaideioIcon("bell", "Bell");
export const BellRing = Bell;
export const BookOpen = createPaideioIcon("book", "BookOpen");
export const ScrollText = BookOpen;
export const Brain = createPaideioIcon("brain", "Brain");
export const CalendarDays = createPaideioIcon("calendar", "CalendarDays");
export const CalendarCheck = createPaideioIcon("calendar-check", "CalendarCheck");
export const CalendarCheck2 = CalendarCheck;
export const CalendarX2 = createPaideioIcon("calendar-x", "CalendarX");
export const CalendarClock = createPaideioIcon("calendar-clock", "CalendarClock");
export const Check = createPaideioIcon("check", "Check");
export const CheckIcon = Check;
export const CheckCircle2 = createPaideioIcon("check-circle", "CheckCircle");
export const CircleCheckIcon = CheckCircle2;
export const ChevronDownIcon = createPaideioIcon("chevron", "ChevronDown");
export const ChevronUpIcon = createPaideioIcon("chevron", "ChevronUp");
export const ChevronLeft = createPaideioIcon("chevron-left", "ChevronLeft");
export const ChevronRight = createPaideioIcon("chevron-right", "ChevronRight");
export const Circle = createPaideioIcon("circle", "Circle");
export const CircleDot = createPaideioIcon("circle-dot", "CircleDot");
export const CircleUserRound = createPaideioIcon("user", "CircleUser");
export const User = CircleUserRound;
export const UserRound = CircleUserRound;
export const UserRoundCog = createPaideioIcon("user-cog", "UserCog");
export const Users = createPaideioIcon("users", "Users");
export const ClipboardCheck = createPaideioIcon("clipboard", "ClipboardCheck");
export const Clock = createPaideioIcon("clock", "Clock");
export const Clock3 = Clock;
export const Dumbbell = createPaideioIcon("dumbbell", "Dumbbell");
export const Euro = createPaideioIcon("euro", "Euro");
export const ExternalLink = createPaideioIcon("external", "ExternalLink");
export const Eye = createPaideioIcon("eye", "Eye");
export const Flame = createPaideioIcon("flame", "Flame");
export const Gavel = createPaideioIcon("gavel", "Gavel");
export const GraduationCap = createPaideioIcon("cap", "GraduationCap");
export const Heart = createPaideioIcon("heart", "Heart");
export const History = createPaideioIcon("history", "History");
export const Home = createPaideioIcon("home", "Home");
export const Inbox = createPaideioIcon("inbox", "Inbox");
export const Info = createPaideioIcon("info", "Info");
export const InfoIcon = Info;
export const LayoutDashboard = createPaideioIcon("dashboard", "Dashboard");
export const LayoutList = createPaideioIcon("list", "List");
export const Rows3 = createPaideioIcon("rows", "Rows");
export const Lightbulb = createPaideioIcon("bulb", "Lightbulb");
export const Loader2Icon = createPaideioIcon("loader", "Loader");
export const MapPin = createPaideioIcon("pin", "MapPin");
export const MapPinned = MapPin;
export const MessageSquarePlus = createPaideioIcon("message", "MessagePlus");
export const MessageSquareText = createPaideioIcon("message", "MessageText");
export const MessagesSquare = createPaideioIcon("message", "Messages");
export const Moon = createPaideioIcon("moon", "Moon");
export const Sun = createPaideioIcon("sun", "Sun");
export const Network = createPaideioIcon("network", "Network");
export const Share2 = Network;
export const PackageOpen = createPaideioIcon("package", "Package");
export const Quote = createPaideioIcon("quote", "Quote");
export const Search = createPaideioIcon("search", "Search");
export const Send = createPaideioIcon("send", "Send");
export const SlidersHorizontal = createPaideioIcon("filters", "Filters");
export const Sparkles = createPaideioIcon("sparkles", "Sparkles");
export const Star = createPaideioIcon("star", "Star");
export const Swords = createPaideioIcon("swords", "Swords");
export const Target = createPaideioIcon("target", "Target");
export const TrendingUp = createPaideioIcon("trend", "TrendingUp");
export const AlertTriangle = createPaideioIcon("warning", "Warning");
export const TriangleAlertIcon = AlertTriangle;
export const Triangle = createPaideioIcon("triangle", "Triangle");
export const X = createPaideioIcon("x", "X");
export const XIcon = X;
export const XCircle = X;
export const OctagonXIcon = X;
