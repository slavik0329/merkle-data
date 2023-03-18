import styled from "styled-components";
import { theme } from "../utils/theme";

export const OuterScreenBlockPadding = styled.div`
  padding: 1rem 2rem;
  box-sizing: border-box;
  height: 100%;

  @media only screen and (max-width: 800px) {
    padding: 0.5rem 0.5rem;
  }
`;

export const PageTitle = styled.div`
  font-weight: 500;
  color: ${theme.neutrals["cool-grey-600"]};
  font-size: 16px;
  word-break: break-word;
`;

type ScreenOuterBlockProps = {
  width?: number;
};

export const ScreenOuterBlock = styled.div<ScreenOuterBlockProps>`
  margin: 0 auto;
  max-width: ${({ width }) => width ?? 1200}px;
`;

export const globalRadiusWhite = `
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 20px #e6e6e6;
`;

export const ScreenWhiteBlock = styled.div`
  padding: 2rem 3rem;
  ${globalRadiusWhite};

  @media only screen and (max-width: 750px) {
    padding: 0.5rem 0.5rem;
  }
`;

export const TableHolder = styled.div`
  margin-top: 12px;
  overflow-x: auto;
`;

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;
export const Alert = styled.div`
  background-color: ${theme.primary["orange-vivid-700"]};
  display: flex;
  padding: 10px 15px;
  justify-content: center;
  border-radius: 2px;
  color: #fff;
  align-items: center;
  margin-bottom: 1rem;
`;
