type WSHandlers<T> = {
  onMessage: (data: T) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

export function useWebSocket<T = any>(url: string, handlers: WSHandlers<T>) {
  let ws: WebSocket | null = null;
  
  const connect = () => {
    try {
      ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log(`WebSocket connected to ${url}`);
        handlers.onOpen?.();
      };
      
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          handlers.onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log(`WebSocket disconnected from ${url}`);
        handlers.onClose?.();
        // 简单重连
        setTimeout(connect, 2000);
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error on ${url}:`, error);
      };
    } catch (error) {
      console.error(`Failed to create WebSocket connection to ${url}:`, error);
    }
  };
  
  const close = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };
  
  connect();
  
  return { close };
}
