import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${error}`);
  }

  if (code) {
    // Create response upfront so setAll can modify it
    const response = NextResponse.redirect(`${origin}${next}`, { status: 302 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
            });
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
    }

    // Force session refresh to trigger setAll before returning response
    await supabase.auth.getUser();

    return response;
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
