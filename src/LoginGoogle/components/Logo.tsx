import { styled } from "@mui/material";

const LinkStyled = styled('a')(() => ({
    height: "70px",
    width: "180px",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
}));

export const Logo = () => {

  return (
    <LinkStyled href="/">
        <img
            src="/Google__G__logo.png"
            alt="Logo Google"
            height={86}
            width={160}
        />
    </LinkStyled>
  );
};

