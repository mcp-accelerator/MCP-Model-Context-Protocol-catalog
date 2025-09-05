# Minimal MCP bundle skeleton (FastMCP).
# Goal: expose tools that call chosen providers' APIs.
import os
from fastmcp import MCP

mcp = MCP("bundle")

# EXAMPLE: register a trivial tool; in real template, generate one per capability/provider
@mcp.tool()
def ping(text: str) -> str:
    """Echo input."""
    return f"pong: {text}"

if __name__ == "__main__":
    # Transport switches by CLI args or env; default stdio
    # For streamable HTTP you'd call: mcp.run_http(host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
    mcp.run_stdio()
