import { serve, Response, RequestHandler, RequestContext } from '../index';

async function fetchUserByToken(token: string | null) {
  return token ? 'Johnny' : undefined;
}

export function withAuthentication<C extends RequestContext>(
  handler: RequestHandler<C & { user: string }>
): RequestHandler<C> {
  return async ctx => {
    const token = ctx.request.headers.get('authorization');
    const user: string | undefined = await fetchUserByToken(token);
    if (!user) {
      return new Response('Get out!', { status: 401 });
    }
    return handler({ ...ctx, user });
  };
}

export function withServerTiming(handler: RequestHandler): RequestHandler {
  return async ctx => {
    const start = Date.now();
    const response = await handler(ctx);
    const duration = Date.now() - start;
    response.headers.set('server-timing', `total;dur=${duration}`);
    return response;
  };
}

export default serve(
  withServerTiming(
    withAuthentication(({ user }) => {
      return Response.json({ user });
    })
  )
);
