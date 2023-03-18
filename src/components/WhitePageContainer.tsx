import React from "react";
import {
  OuterScreenBlockPadding,
  ScreenOuterBlock,
  ScreenWhiteBlock,
} from "../styles/page";

type Props = {
  children: React.ReactNode;
  className?: string;
  width?: number;
};

export default function WhitePageContainer({
  children,
  className,
  width,
}: Props) {
  return (
    <OuterScreenBlockPadding className={className}>
      <ScreenOuterBlock width={width}>
        <ScreenWhiteBlock>{children}</ScreenWhiteBlock>
      </ScreenOuterBlock>
    </OuterScreenBlockPadding>
  );
}
