export const TARGETS_LOADER_MARKER = 'apple-targets-extension-loader';

/**
 * The Podfile loader block (byte-for-byte from @bacons/apple-targets'
 * `withPodTargetExtension`), parameterized by the targets root directory.
 * For the default "targets" root this is identical to bacons' output.
 */
export function buildTargetsPodfileLoader(targetsRootClean: string): string {
  return `# ${TARGETS_LOADER_MARKER} -- Dynamic loading of target configurations
Dir.glob(File.join(__dir__, '..', '${targetsRootClean}', '**', 'pods.rb')).each do |target_file|
  target_name = File.basename(File.dirname(target_file))
  target target_name do
    # Create a new binding with access to necessary methods and variables
    target_binding = binding
    target_binding.local_variable_set(:podfile_properties, podfile_properties)

    # Evaluate the target file content in the new binding
    eval(File.read(target_file), target_binding, target_file)
  end
end
`;
}
