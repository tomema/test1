
interface WindowChain {
    ethereum?: {
      isMetaMask?: true
      request?: (...args: any[]) => void
    }
  }
  
  declare module 'theme-change' {
    export const themeChange: (b: boolean) => void
  }