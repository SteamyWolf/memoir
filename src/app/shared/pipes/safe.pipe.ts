import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

// this pipe sanitizes the url allowing an object url to be created on the image. Use as a pipe on the [src].
@Pipe({ name: 'safeResourceUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  public transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}