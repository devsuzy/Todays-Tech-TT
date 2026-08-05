import type { Request, RequestHandler, Response } from 'express'

/**
 * Express 4는 async 핸들러가 reject해도 잡아주지 않아 요청이 그대로 매달린다.
 * 모든 async 핸들러를 감싸 500 INTERNAL_ERROR로 응답을 통일한다.
 */
export function asyncHandler(
  handler: (req: Request, res: Response) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch((err) => {
      // 이미 응답을 보낸 뒤라면 Express 기본 에러 처리에 맡긴다
      if (res.headersSent) return next(err)
      res.status(500).json({ error: 'INTERNAL_ERROR' })
    })
  }
}
