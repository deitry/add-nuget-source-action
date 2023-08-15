# Add Nuget Source action

Adds NuGet source and clears it in the end of the workflow

## Example

```yaml
- name: Add NuGet package source
  uses: deitry/add-nuget-source-action@v1
  with:
    url: https://nuget.pkg.github.com/my-org/index.json
    username: arrivederci
    password: ${{ secrets.MY_SECRET }}
```