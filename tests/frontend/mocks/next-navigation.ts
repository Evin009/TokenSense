// Mock for next/navigation — returns sensible defaults for unit tests

export const usePathname = jest.fn(() => "/")
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
}))
export const useSearchParams = jest.fn(() => new URLSearchParams())
export const useParams = jest.fn(() => ({}))
