/*
 * These are docker run CMD entrypoint arguments that follow the container name.
 */
export function docker_args(env) {

  let model_id = env.url ?? env.model_name;

  if( !exists(model_id) && exists(env.parent) )
    model_id = env.parent.url ?? env.parent.model_name;

  const model_api = get_model_api(model_id)
  const model_repo = get_model_repo(model_id);
  const server_url = get_server_url(env);

  let args = `  --model ${model_repo} \\
      --quantization ${env.quantization} \\
      --max-batch-size ${env.max_batch_size}`;

  if( is_number(env.max_context_len) ) {
    args += ` \\
      --max-context-len ${env.max_context_len}`;
  }

  if( is_number(env.prefill_chunk) ) {
    args += ` \\
      --prefill-chunk ${env.prefill_chunk}`;
  }

  if( nonempty(env.chat_template) ) {
    args += ` \\
      --chat-template ${env.chat_template}`;
  }

  if( exists(server_url) ) {
    args += ` \\
      --host ${server_url.hostname} \\
      --port ${server_url.port}`;
  }

  if( exists(env.docker_args) ) {
    args += ` \\
        ${env.docker_args}`;
  }

  return args;
}
